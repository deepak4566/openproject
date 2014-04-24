//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

// ╭───────────────────────────────────────────────────────────────╮
// │  _____ _                _ _                                   │
// │ |_   _(_)_ __ ___   ___| (_)_ __   ___  ___                   │
// │   | | | | '_ ` _ \ / _ \ | | '_ \ / _ \/ __|                  │
// │   | | | | | | | | |  __/ | | | | |  __/\__ \                  │
// │   |_| |_|_| |_| |_|\___|_|_|_| |_|\___||___/                  │
// ├───────────────────────────────────────────────────────────────┤
// │ Javascript library that fetches and plots timelines for the   │
// │ OpenProject timelines module.                                 │
// ╰───────────────────────────────────────────────────────────────╯

// stricter than default
/*jshint undef:true,
         eqeqeq:true,
         forin:true,
         immed:true,
         latedef:true,
         trailing: true
*/

// looser than default
/*jshint eqnull:true */

// environment and other global vars
/*jshint browser:true, devel:true */
/*global jQuery:false, Timeline:true */

if (typeof Timeline === "undefined") {
  Timeline = {};
}

//UI?
jQuery.extend(Timeline, {

  // ╭───────────────────────────────────────────────────────────────────╮
  // │ UI and Plotting                                                   │
  // ╰───────────────────────────────────────────────────────────────────╯

  DEFAULT_COLOR: '#999999',
  DEFAULT_FILL_COLOR_IN_COMPARISONS: 'none',
  DEFAULT_LANE_COLOR: '#000000',
  DEFAULT_LANE_WIDTH: 1,
  DEFAULT_PARENT_COLOR: '#666666',
  DEFAULT_STROKE_COLOR: '#000000',
  DEFAULT_STROKE_COLOR_IN_COMPARISONS: '#000000',
  DEFAULT_STROKE_DASHARRAY_IN_COMPARISONS: '', // other examples: '-', '- ', '-- '
  DEFAULT_COMPARISON_OFFSET: 5,

  DAY_WIDTH: 16,

  MIN_CHART_WIDTH: 200,
  RENDER_BUCKET_SIZE: 32,
  ORIGINAL_BORDER_WIDTH_CORRECTION: 3,
  BORDER_WIDTH_CORRECTION: 3,
  HOVER_THRESHOLD: 3,

  GROUP_BAR_INDENT: -10,

  PE_DARK_TEXT_COLOR: '#000000',    // color on light planning element.
  PE_DEFAULT_TEXT_COLOR: '#000000', // color on timelines background.
  PE_HEIGHT: 20,
  PE_LIGHT_TEXT_COLOR: '#ffffff',   // color on dark planning element.
  PE_LUMINANCE_THRESHOLD: 0.5,      // threshold above which dark text is rendered.
  PE_TEXT_ADDITIONAL_OUTSIDE_PADDING_WHEN_MILESTONE: 6,
  PE_TEXT_ADDITIONAL_OUTSIDE_PADDING_WHEN_EXPANDED_WITH_CHILDREN: 6,
  PE_TEXT_INSIDE_PADDING: 8,        // 4px padding on both sides of the planning element towards an inside labelelement towards an inside label.
  PE_TEXT_OUTSIDE_PADDING: 6,       // space between planning element and text to its right.
  PE_TEXT_AGGREGATED_LABEL_WIDTH_THRESHOLD: 5,

  USE_MODALS: true,

  scale: 1,
  zoomIndex: 0,

  // OUTLINE_LEVELS define possible OUTLINE_CONFIGURATIONS.
  OUTLINE_LEVELS: ['aggregation', 'level1', 'level2', 'level3', 'level4', 'level5', 'all'],
  OUTLINE_CONFIGURATIONS: {
    aggregation: { name: 'timelines.outlines.aggregation', level: 0 },
    level1:      { name: 'timelines.outlines.level1',      level: 1 },
    level2:      { name: 'timelines.outlines.level2',      level: 2 },
    level3:      { name: 'timelines.outlines.level3',      level: 3 },
    level4:      { name: 'timelines.outlines.level4',      level: 4 },
    level5:      { name: 'timelines.outlines.level5',      level: 5 },
    all:         { name: 'timelines.outlines.all',         level: Infinity }
  },

  // ZOOM_SCALES define possible ZOOM_CONFIGURATIONS.
  ZOOM_SCALES: ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'],
  ZOOM_CONFIGURATIONS: {
    daily:     {name: 'timelines.zoom.days',     scale: 1.40, config: ['months', 'weeks', 'actualDays', 'weekDays']},
    weekly:    {name: 'timelines.zoom.weeks',    scale: 0.89, config: ['months', 'weeks', 'weekDays']},
    monthly:   {name: 'timelines.zoom.months',   scale: 0.53, config: ['years', 'months', 'weeks']},
    quarterly: {name: 'timelines.zoom.quarters', scale: 0.21, config: ['year-quarters', 'months', 'weeks']},
    yearly:    {name: 'timelines.zoom.years',    scale: 0.10, config: ['years', 'quarters', 'months']}
  },
  getScale: function() {
    var day = this.DAY_WIDTH * this.scale;
    var week = day * 7;
    var height = Timeline.PE_HEIGHT;

    return {
      height: height,
      week: week,
      day: day
    };
  },
  setScale: function(scale) {
    // returns width for specified scale
    if (!scale) {
      scale = this.scale;
    } else {
      this.scale = scale;
    }
    var days = this.getDaysBetween(
      this.getBeginning(),
      this.getEnd()
    );
    return days * this.DAY_WIDTH * scale;
  },
  getWidth: function() {

    // width is the wider of the currently visible chart dimensions
    // (adjusted_width) and the minimum space the timeline needs.
    return Math.max(this.adjusted_width, this.setScale() + 200);
  },
  resetWidth: function() {
    delete this.adjusted_width;
  },
  adjustWidth: function(width) {
    // adjusts for the currently visible chart dimensions.
    var old_adjusted_width = this.adjusted_width;

    this.adjusted_width = this.adjusted_width === undefined?
      width: Math.max(old_adjusted_width, Math.max(width, this.adjusted_width));

    if (old_adjusted_width < this.adjusted_width) {
      this.rebuildAll();
    }

    return this.adjusted_width;
  },
  getHeight: function() {
    return this.getMeasuredHeight() - this.getMeasuredScrollbarHeight();
  },
  scaleToFit: function(width) {
    var scale = width / (this.DAY_WIDTH * this.getDaysBetween(
      this.getBeginning(),
      this.getEnd()
    ));
    this.setScale(scale);
    return scale;
  },
  getColorParts: function(color) {
    return jQuery.map(color.match(/[0-9a-fA-F]{2}/g), function(e, i) {
      return parseInt(e, 16);
    });
  },
  getLuminanceFor: function(color) {
    var parts = this.getColorParts(color);
    var result = (0.299 * parts[0] + 0.587 * parts[1] + 0.114 * parts[2]) / 256;
    return result;
  },

  expandTo: function(index) {
    var level;
    index = Math.max(index, 0);
    level = Timeline.OUTLINE_CONFIGURATIONS[Timeline.OUTLINE_LEVELS[index]].level;
    if (this.options.hide_tree_root) {
      level++;
    }
    level = this.getLefthandTree().expandTo(level);
    this.expansionIndex = index;
    this.rebuildAll();
  },

  zoom: function(index) {
    if (index === undefined) {
      index = this.zoomIndex;
    }
    index = Math.max(Math.min(this.ZOOM_SCALES.length - 1, index), 0);
    this.zoomIndex = index;
    var scale = Timeline.ZOOM_CONFIGURATIONS[Timeline.ZOOM_SCALES[index]].scale;
    this.setScale(scale);
    this.resetWidth();
    this.triggerResize();
    this.rebuildAll();
  },
  zoomIn: function() {
    this.zoom(this.zoomIndex + 1);
  },
  zoomOut: function() {
    this.zoom(this.zoomIndex - 1);
  },
  getSwimlaneStyles: function() {
    return [{
        textColor: '#000000',
        laneColor: '#e7e7e7'
      }, {
        textColor: '#000000',
        laneColor: '#797979'
      }, {
        // laneWidth: 1.5,
        textColor: '#000000',
        laneColor: '#424242'
      }, {
        // laneWidth: 2,
        textColor: '#000000',
        laneColor: '#000000'
      }];
  },
  getSwimlaneConfiguration: function() {
    return {
      'actualDays': {
        // actual days
        delimiter: this.getBeginning().moveToFirstDayOfMonth().moveToDayOfWeek(Date.CultureInfo.firstDayOfWeek, -1),
        caption: function() { return this.delimiter.toString('d'); },
        next: function() { return this.delimiter.addDays(1); },
        overrides: ['weekDays']
      },
      'weekDays': {
        // weekdays
        delimiter: this.getBeginning().moveToFirstDayOfMonth().moveToDayOfWeek(Date.CultureInfo.firstDayOfWeek, -1),
        caption: function() { return this.delimiter.toString('ddd')[0]; },
        next: function() { return this.delimiter.addDays(1); },
        overrides: ['actualDays']
      },
      'weeks': {
        // weeks
        delimiter: this.getBeginning().moveToFirstDayOfMonth().moveToDayOfWeek(Date.CultureInfo.firstDayOfWeek, -1),
        caption: function() { return this.delimiter.getWeekOfYear(); },
        next: function() { return this.delimiter.addWeeks(1); },
        overrides: ['weekDays', 'actualDays']
      },
      'months': {
        // months
        delimiter: this.getBeginning().moveToFirstDayOfMonth(),
        caption: function() { return Date.CultureInfo.abbreviatedMonthNames[this.delimiter.getMonth()]; },
        next: function() { return this.delimiter.addMonths(1); },
        overrides: ['actualDays', 'weekDays', 'quarters']
      },
      'year-quarters': {
        // quarters
        delimiter: this.getBeginning().moveToMonth(0, -1).moveToFirstDayOfMonth(),
        caption: function() { return Date.CultureInfo.abbreviatedQuarterNames[this.delimiter.getQuarter()] + " " + this.delimiter.toString('yyyy'); },
        next: function() { return this.delimiter.addQuarters(1); },
        overrides: ['actualDays', 'weekDays', 'months', 'quarters']
      },
      'quarters': {
        // quarters
        delimiter: this.getBeginning().moveToMonth(0, -1).moveToFirstDayOfMonth(),
        caption: function() { return Date.CultureInfo.abbreviatedQuarterNames[this.delimiter.getQuarter()]; },
        next: function() { return this.delimiter.addQuarters(1); },
        overrides: ['actualDays', 'weekDays', 'months']
      },
      'years': {
        // years
        delimiter: this.getBeginning().moveToMonth(0, -1).moveToFirstDayOfMonth(),
        caption: function() { return this.delimiter.toString('yyyy'); },
        next: function() { return this.delimiter.addYears(1); },
        overrides: ['actualDays', 'weekDays', 'months', 'quarters']
      }};
  },
  getAvailableRows: function() {
    function renderHistoricalKind(data, val, diff) {
        if (!data.does_historical_differ(val)) {
          return "";
        }

        if (typeof diff === "function") {
          return diff(data[val], data.historical()[val]);
        }

        return "changed";
    }

    function historicalHtml(data, val) {
        var kind = renderHistoricalKind(data, val);

        return renderHistoricalHtml(data, val, kind);
    }

    function renderHistoricalHtml(data, val, kind) {
        var result = "", theVal;

        if (data.does_historical_differ(val)) {
          theVal = data.historical().getAttribute(val);

          if (!theVal) {
            theVal = timeline.i18n('timelines.empty');
          }

          result += '<span class="tl-historical">';
          result += timeline.escape(theVal);
          result += '<a href="javascript://" title="%t" class="%c"/>'
            .replace(/%t/, timeline.i18n('timelines.change'))
            .replace(/%c/, 'tl-icon-' + kind);
          result += '</span><br/>';
        }

        return result;
    }

    function historicalKindDate(oldVal, newVal) {
      if (oldVal && newVal) {
        return (newVal < oldVal ? 'postponed' : 'preponed');
      }

      return "changed";
    }

    var map = {
      "type": "getTypeName",
      "status": "getStatusName",
      "responsible": "getResponsibleName",
      "assigned_to": "getAssignedName",
      "project": "getProjectName"
    };

    function booleanCustomFieldValue(value) {
      if (value) {
        if (value === "1") {
          return timeline.i18n("general_text_Yes")
        } else if (value === "0") {
          return timeline.i18n("general_text_No")
        }
      }
    }

    function formatCustomFieldValue(value, custom_field_id) {
      switch(timeline.custom_fields[custom_field_id].field_format) {
        case "bool":
          return booleanCustomFieldValue(value);
        case "user":
          if (timeline.users[value])
            return timeline.users[value].name;
        default:
          return value;
      }
    }

    function getCustomFieldValue(data, custom_field_name) {
      var custom_field_id = parseInt(custom_field_name.substr(3), 10), value = data[custom_field_name];

      if (value) {
        return jQuery('<span class="tl-column">' + timeline.escape(formatCustomFieldValue(value, custom_field_id)) + '</span>');
      }
    }

    var timeline = this;
    return {
      all: ['due_date', 'type', 'status', 'responsible', 'start_date'],
      general: function (data, val) {
        if (val.substr(0, 3) === "cf_") {
          return getCustomFieldValue(data, val);
        }

        if (!map[val]) {
          return;
        }

        val = map[val];

        var result = "";
        var theVal = data.getAttribute(val);

        result += historicalHtml(data, val);
        return jQuery(result + '<span class="tl-column">' + timeline.escape(theVal) + '</span>');
      },
      start_date: function(data) {
        var kind = renderHistoricalKind(data, "start_date", historicalKindDate),
            result = '';

        result += renderHistoricalHtml(data, "start_date", kind);

        if (data.start_date !== undefined) {
          result += '<span class="tl-column tl-current tl-' + kind + '">' + timeline.escape(data.start_date) + '</span>';
        }
        return jQuery(result);
      },
      due_date: function(data) {
        var kind = renderHistoricalKind(data, "due_date", historicalKindDate),
            result = '';

        result += renderHistoricalHtml(data, "due_date", kind);

        if (data.due_date !== undefined) {
          result += '<span class="tl-column tl-current tl-' + kind + '">' +
                    timeline.escape(data.due_date) + '</span>';
        }
        return jQuery(result);
      }
    };
  },
  getUiRoot: function() {
    return this.uiRoot;
  },
  getEventHandlerSuffix: function() {
    if (this.event_handler_suffix === undefined) {
      this.event_handler_suffix = this.getUiRoot().attr('id');
    }
    return this.event_handler_suffix;
  },
  getTooltip: function() {
    var tooltip = this.getUiRoot().find('.tl-tooltip');

    return tooltip;
  },
  getChart: function() {
    return this.getUiRoot().find('.tl-chart');
  },

  i18n: function(key) {
    var value = this.options.i18n[key];
    var message;
    if (value === undefined) {
      message = 'translation missing: ' + key;
      if (console && console.log) {
        console.log(message);
      }
      return message;
    } else {
      return value;
    }
  },

  setupUI: function() {
    this.setupToolbar();
    this.setupChart();
  },
  setupToolbar: function() {
    // ╭───────────────────────────────────────────────────────╮
    // │  Builds the following dom and adds it to root:        │
    // │                                                       │
    // │  <div class="tl-toolbar"> ... </div>                  │
    // ╰───────────────────────────────────────────────────────╯
    // TODO: Because it is easier to maintain HTML in HTML, this
    //       method should actually become a partial. The
    //       implementors of this method decided it to be in
    //       JavaScript because it is then easier to connect the
    //       toolbar to a specific timeline.

    var toolbar = jQuery('<div class="tl-toolbar"></div>');
    var timeline = this;
    var i, c, containers = [
      0,
      1,
      0, 100, 0, 0, // zooming
      1,
      0, 0          // outline
    ];
    var icon = '<a href="javascript://" title="%t" class="%c"/>';
    var iconText = '<span class="hidden-for-sighted">';

    for (i = 0; i < containers.length; i++) {
      c = jQuery('<div class="tl-toolbar-container"></div>');
      if (containers[i] !== 0) {
        c.css({
          'width': containers[i] + 'px',
          'height': '20px'
        });
      }
      containers[i] = c;
      toolbar.append(c);
    }
    this.getUiRoot().append(toolbar);

    var currentContainer = 0;

    if (Timeline.USE_MODALS) {

      // ╭───────────────────────────────────────────────────────╮
      // │  Add element                                          │
      // ╰───────────────────────────────────────────────────────╯

      var workPackageAddIcon = jQuery(icon
                                       .replace(/%t/, timeline.i18n('timelines.new_work_package'))
                                       .replace(/%c/, 'icon icon-add')
                                     ).click(function(e) {
                                       e.stopPropagation();
                                       timeline.addPlanningElement();
                                       return false;
                                     });
      var workPackageAddLabel = jQuery(iconText).text(timeline.i18n('timelines.new_work_package'));

      workPackageAddIcon.append(workPackageAddLabel);

      containers[currentContainer++].append(workPackageAddIcon);

      // ╭───────────────────────────────────────────────────────╮
      // │  Spacer                                               │
      // ╰───────────────────────────────────────────────────────╯

      containers[currentContainer++].css({
        'background-color': '#000000'
      });

    } else {
      currentContainer += 2;
    }

    // ╭───────────────────────────────────────────────────────╮
    // │  Zooming                                              │
    // ╰───────────────────────────────────────────────────────╯

    // drop-down
    var form = jQuery('<form></form>');
    var zooms_label = jQuery('<label></label>').attr("for", "tl-toolbar-zooms")
                                               .addClass("hidden-for-sighted")
                                               .text(I18n.t("js.tl_toolbar.zooms"));
    var zooms = jQuery('<select></select>').attr("name", "zooms")
                                           .attr("id", "tl-toolbar-zooms");
    for (i = 0; i < Timeline.ZOOM_SCALES.length; i++) {
      zooms.append(jQuery(
            '<option>' +
            timeline.i18n(Timeline.ZOOM_CONFIGURATIONS[Timeline.ZOOM_SCALES[i]].name) +
            '</option>'));
    }
    form.append(zooms_label);
    form.append(zooms);
    containers[currentContainer + 3].append(form);

    // slider
    var slider = jQuery('<div></div>').slider({
      min: 1,
      max: Timeline.ZOOM_SCALES.length,
      range: 'min',
      value: zooms[0].selectedIndex + 1,
      slide: function(event, ui) {
        zooms[0].selectedIndex = ui.value - 1;
      },
      change: function(event, ui) {
        zooms[0].selectedIndex = ui.value - 1;
        timeline.zoom(ui.value - 1);
      }
    }).css({
      // top right bottom left
      'margin': '4px 6px 3px'
    });
    var sliderHandleLabel = jQuery(iconText).text(I18n.t('js.timelines.zoom_slider'));
    var sliderHandle = slider.find('a.ui-slider-handle');

    sliderHandle.append(sliderHandleLabel);

    containers[currentContainer + 1].append(slider);
    zooms.change(function() {
      slider.slider('value', this.selectedIndex + 1);
    });

    // zoom out
    containers[currentContainer].append(
      jQuery(icon
        .replace(/%t/, timeline.i18n('timelines.zoom.out'))
        .replace(/%c/, 'tl-icon-zoomout')
      ).click(function() {
        slider.slider('value', slider.slider('value') - 1);
      }));

    // zoom in
    containers[currentContainer + 2].append(
      jQuery(icon
        .replace(/%t/, timeline.i18n('timelines.zoom.in'))
        .replace(/%c/, 'tl-icon-zoomin')
      ).click(function() {
        slider.slider('value', slider.slider('value') + 1);
      }));

    currentContainer += 4;

    // ╭───────────────────────────────────────────────────────╮
    // │  Spacer                                               │
    // ╰───────────────────────────────────────────────────────╯

    containers[currentContainer++].css({
      'background-color': '#000000'
    });

    // ╭───────────────────────────────────────────────────────╮
    // │  Outline                                              │
    // ╰───────────────────────────────────────────────────────╯

    // drop-down
    // TODO this is very similar to the way the zoom dropdown is
    // assembled. Refactor to avoid code duplication!
    form = jQuery('<form></form>');
    var outlines_label = jQuery('<label></label>').attr("for", "tl-toolbar-outlines")
                                                  .addClass("hidden-for-sighted")
                                                  .text(I18n.t("js.tl_toolbar.outlines"));
    var outlines = jQuery('<select></select>').attr("name", "outlines")
                                              .attr("id", "tl-toolbar-outlines");
    for (i = 0; i < Timeline.OUTLINE_LEVELS.length; i++) {
      outlines.append(jQuery(
            '<option>' +
            timeline.i18n(Timeline.OUTLINE_CONFIGURATIONS[Timeline.OUTLINE_LEVELS[i]].name) +
            '</option>'));
    }
    form.append(outlines_label);
    form.append(outlines);
    containers[currentContainer + 1].append(form);

    outlines.change(function() {
      timeline.expandTo(this.selectedIndex);
    });

    // perform outline action again (icon mostly a divider from zooms)
    containers[currentContainer].append(
      jQuery(icon
        .replace(/%t/, timeline.i18n('timelines.outline'))
        .replace(/%c/, 'tl-icon-outline')
      ).click(function() {
        timeline.expandTo(outlines[0].selectedIndex);
      }));

    currentContainer += 2;

    this.updateToolbar = function() {
      slider.slider('value', timeline.zoomIndex + 1);
      outlines[0].selectedIndex = timeline.expansionIndex;
    };
  },
  setupChart: function() {

    // ╭───────────────────────────────────────────────────────╮
    // │  Builds the following dom and adds it to root:        │
    // │                                                       │
    // │  <div class="timeline tl-under-construction">         │
    // │    <div class="tl-left">                              │
    // │      <div class="tl-left-top tl-decoration"></div>    │
    // │      <div class="tl-left-main"></div>                 │
    // │    </div>                                             │
    // │    <div class="tl-right">                             │
    // │      <div class="tl-right-top tl-decoration"></div>   │
    // │      <div class="tl-right-main"></div> (optional)     │
    // │    </div>                                             │
    // │    <div class="tl-scrollcontainer">                   │
    // │      <!--div class="tl-decoration"></div-->           │
    // │      <div class="tl-chart"></div>                     │
    // │    </div>                                             │
    // │    <div class="tl-tooltip fade above in">             │
    // │      <div class="tl-tooltip-inner"></div>             │
    // │      <div class="tl-tooltip-arrow"></div>             │
    // │    </div>                                             │
    // │  </div>                                               │
    // ╰───────────────────────────────────────────────────────╯

    var timeline = jQuery('<div class="timeline tl-under-construction"></div>');

    var tlLeft = jQuery('<div class="tl-left"></div>')
      .append(jQuery('<div class="tl-left-top tl-decoration"></div>'))
      .append(jQuery('<div class="tl-left-main"></div>'));

    var tlRight = jQuery('<div class="tl-right"></div>')
      .append(jQuery('<div class="tl-right-top tl-decoration"></div>'))
      .append(jQuery('<div class="tl-right-main"></div>'));

    var paper = jQuery('<div class="tl-chart"></div>');

    var tlScrollContainer = jQuery('<div class="tl-scrollcontainer"></div>')
      //.append(jQuery('<div class="tl-decoration"></div>'))
      .append(paper);

    var tlTooltip = jQuery('<div class="tl-tooltip fade above in"></div>')
      .append('<div class="tl-tooltip-inner"></div>')
      .append('<div class="tl-tooltip-arrow"></div>');

    timeline
      .append(tlLeft)
      .append(tlRight)
      .append(tlScrollContainer)
      .append(tlTooltip);

    this.getUiRoot().append(timeline);

    // store the paper element for later use.
    this.paperElement = paper[0];
  },

  completeUI: function() {
    var timeline = this;

    // construct tree on left-hand-side.
    this.rebuildTree();

    // lift the curtain, paper otherwise doesn't show w/ VML.
    jQuery('.timeline').removeClass('tl-under-construction');
    this.paper = new Timeline.SvgHelper(this.paperElement);

    // perform some zooming. if there is a zoom level stored with the
    // report, zoom to it. otherwise, zoom out. this also constructs
    // timeline graph.
    if (this.options.zoom_factor &&
        this.options.zoom_factor.length === 1) {

      this.zoom(
        this.pnum(this.options.zoom_factor[0])
      );

    } else {
      this.zoomOut();
    }

    // perform initial outline expansion.
    if (this.options.initial_outline_expansion &&
        this.options.initial_outline_expansion.length === 1) {

      this.expandTo(
        this.pnum(this.options.initial_outline_expansion[0])
      );
    }

    // zooming and initial outline expansion have consequences in the
    // select inputs in the toolbar.
    this.updateToolbar();

    this.getChart().scroll(function() {
      timeline.adjustTooltip();
    });

    jQuery(window).scroll(function() {
      timeline.adjustTooltip();
    });
  },

  getMeasuredHeight: function() {
    return this.getUiRoot().find('.tl-left-main').height();
  },
  getMeasuredScrollbarHeight: function() {
    var p, div, h, hh;

    // this method is built on the assumption that the width of a
    // vertical scrollbar is equal o the height of a horizontal one. if
    // that symmetry is broken, this method will need to be repaired.

    if (this.scrollbar_height !== undefined) {
      return this.scrollbar_height;
    }

    p = jQuery('<p/>').css({
      'width':  "100%",
      'height': "200px"
    });

    div = jQuery('<div/>').css({
      'position':   "absolute",
      'top':        "0",
      'left':       "0",
      'visibility': "hidden",
      'width':      "200px",
      'height':     "150px",
      'overflow':   "hidden"
    });

    div.append(p);
    jQuery('body').append(div);
    h = p[0].offsetWidth;
    div.css({'overflow': 'scroll'});
    hh = p[0].offsetWidth;
    if (h === hh) {
      hh = div[0].clientWidth;
    }
    div.remove();

    this.scrollbar_height = (h - hh);
    return this.scrollbar_height;
  },

  escape: function(string) {
    return jQuery('<div/>').text(string).html();
  },
  psub: function(string, map) {
    return string.replace(/#\{(.+?)\}/g, function(m, p, o, s) { return map[p]; });
  },
  pnum: function(string) {
    return parseInt(string.replace(/[^\d\-]/g, ''), 10);
  },
  /**
   * Filter helper for multi select filters based on IDs.
   *
   * Assumption is that array is an array of strings while object is a object
   * with an id field which contains a number
   */
  filterOutBasedOnArray: function (array, object) {
    return !Timeline.idInArray(array, object);
  },
  idInArray: function (array, object) {
    // when object is not set, check if the (none) a.k.a. -1 option is selected
    var id = object ? object.id + '' : '-1';

    if (jQuery.isArray(array) && array.length > 0) {
      return jQuery.inArray(id, array) !== -1;
    }
    else {
      // if there is no array, we just accept.
      return true;
    }
  },

  rebuildAll: function() {
    var timeline = this;
    var root = timeline.getUiRoot();

    delete this.table_offset;

    window.clearTimeout(this.rebuildTimeout);
    this.rebuildTimeout = timeline.defer(function() {
      timeline.rebuildTree();

      // The minimum width of the whole timeline should be the actual
      // width of the table added to the minimum chart width. That way,
      // the floats never break.

      if (timeline.options.hide_chart == null) {
        root.find('.timeline').css({
          'min-width': root.find('.tl-left-main').width() +
                         Timeline.MIN_CHART_WIDTH
        });
      }

      if (timeline.options.hide_chart !== 'yes') {
        timeline.rebuildGraph();
      } else {
        var chart = timeline.getUiRoot().find('.tl-chart');
        chart.css({ display: 'none'});
      }
      timeline.adjustScrollingForChangedContent();
    });
  },

  adjustScrollingForChangedContent: function() {
    var current_height = Math.max(jQuery("body").height(), jQuery("#content").height());
    if(current_height < jQuery(window).scrollTop()) {
      jQuery(window).scrollTop(current_height - jQuery(window).height());
    }
  },

  rebuildTree: function() {
    var where = this.getUiRoot().find('.tl-left-main');
    var tree = this.getLefthandTree();
    var table = jQuery('<table class="tl-main-table"></table>');
    var body = jQuery('<tbody></tbody>');
    var head = jQuery('<thead></thead>');
    var row, cell, link, span, text;
    var timeline = this;
    var rows = this.getAvailableRows();
    var first = true; // for the first row
    var previousGroup = -1;
    var headerHeight = this.decoHeight();

    // head
    table.append(head);
    row = jQuery('<tr></tr>');

    // there is always a name.
    cell = jQuery('<th class="tl-first-column"/>');
    cell.append(timeline.i18n('timelines.filter.column.name'));

    // only compensate for the chart decorations if we're actualy
    // showing one.
    if (timeline.options.hide_chart == null) {
      cell.css({'height': headerHeight + 'px'});
    }
    row.append(cell);

    // everything else.
    var header = function(key) {
      var th = jQuery('<th></th>');
      if (key.substr(0, 3) === "cf_") {
        var customFieldId = parseInt(key.substr(3), 10);
        if (timeline.custom_fields[customFieldId]) {
          th.append(timeline.custom_fields[customFieldId].name);
        }
      } else {
        th.append(timeline.i18n('timelines.filter.column.' + key));
      }
      return th;
    };
    jQuery.each(timeline.options.columns, function(i, e) {
      row.append(header(e));
    });
    head.append(row);

    // body
    table.append(body);

    row = jQuery('<tr></tr>');

    tree.iterateWithChildren(function(node, indent) {
      var data = node.getData();
      var group;

      // create a new cell with the name for the current level.
      row = jQuery('<tr></tr>');
      cell = jQuery(
          '<td class="tl-first-column"></td>'
        );
      row.append(cell);

      var contentWrapper = jQuery('<span class="tl-word-ellipsis"></span>');

      cell.addClass('tl-indent-' + indent);

      // check for start of a new group.
      if (timeline.isGrouping() && data.is(Timeline.Project)) {
        if (indent === 0) {
          group = data.getFirstLevelGrouping();
          if (previousGroup !== group) {

            body.append(jQuery(
              '<tr><td class="tl-grouping" colspan="' +
              (timeline.options.columns.length + 1) + '"><span class="tl-word-ellipsis">' +
              timeline.escape(data.getFirstLevelGroupingName()) +
              '</span></td></tr>'));

            previousGroup = group;
          }
        }
      }

      if (node.hasChildren()) {
        cell.addClass(node.isExpanded() ? 'tl-expanded' : 'tl-collapsed');

        link = jQuery('<a href="javascript:;"/>');
        link.click({'node': node, 'timeline': timeline}, function(event) {
          event.data.node.toggle();
          event.data.timeline.rebuildAll();
        });
        link.append(node.isExpanded() ? '-' : '+');
        cell.append(link);
      }

      cell.append(contentWrapper);

      text = timeline.escape(data.subject || data.name);
      if (data.getUrl instanceof Function) {
        text = jQuery('<a href="' + data.getUrl() + '" class="tl-discreet-link" data-modal/>').append(text).attr("title", text);
      }

      if (data.is(Timeline.Project)) {
        text.addClass('tl-project');
      }

      span = jQuery('<span/>').append(text);
      contentWrapper.append(span);

      // the node will later need to know where on the screen the
      // corresponding table cell is, i.e. for computing the vertical
      // index for planning elements inside the chart.
      node.setDOMElement(cell);

      var added = data.is(Timeline.PlanningElement) && data.isNewlyAdded();
      var change_detected = added || data.is(Timeline.PlanningElement) && data.hasAlternateDates();
      var deleted = data.is(Timeline.PlanningElement) && data.isDeleted();

      // everything else
      jQuery.each(timeline.options.columns, function(i, e) {
        var cell = jQuery('<td></td>');
        if (typeof rows[e] === "function") {
          cell.append(rows[e].call(data, data));
        } else {
          cell.append(rows.general.call(data, data, e));
        }
        row.append(cell);
      });
      body.append(row);

      if (data.is(Timeline.Project)) {
        row.addClass('tl-project-row');
      }

      if (change_detected) {
        span.prepend(

          // the empty span is for a rendering bug in chrome. the anchor
          // would not be displayed as inline, unless there is a change
          // in the css after the rendering (nop changes suffice) or
          // there is some prepended content. this span provides for
          // exactly that.

          jQuery('<span/><a href="javascript://" title="%t" class="%c"/>'
            .replace(/%t/, timeline.i18n('timelines.change'))
            .replace(/%c/, added? 'tl-icon-added' : deleted? 'tl-icon-deleted' : 'tl-icon-changed')
          ));
      }

      // attribute a special class to the first row. this is for
      // additional indentation, however only when we are not in a
      // grouping.

      if (first) {
        first = false;
        if (!timeline.isGrouping()) {
          row.addClass('tl-first-row');
        }
      }
    });

    // attribute a special class to the last row
    if (row !== undefined) {
      row.addClass('tl-last-row');
      row.find('td').append(timeline.scrollbarBox());
    }

    where.empty().append(table);

    var change = [];

    var maxWidth = jQuery("#content").width() * 0.25;
    table.find(".tl-word-ellipsis").each(function (i, e) {
      e = jQuery(e);

      var indent = e.offset().left - e.parent().offset().left;

      if (e.width() > maxWidth - indent) {
        change.push({e: e, w: maxWidth - indent});
      }
    });

    var i;
    for (i = 0; i < change.length; i += 1) {
      change[i].e.css("width", change[i].w);
    }
  },
  scrollbarBox: function() {
    var scrollbar_height = this.getMeasuredScrollbarHeight();
    return jQuery('<div class="tl-invisible"/>').css({
      'height': scrollbar_height,
      'width':  scrollbar_height
    });
  },
  decoHeight: function() {
    var config = Timeline.ZOOM_SCALES[this.zoomIndex];
    var lanes = Timeline.ZOOM_CONFIGURATIONS[config].config.length;
    return 12 * lanes; // -1 is for coordinates starting at 0.
  },
  getPaper: function() {
    return this.paper;
  },
  rebuildGraph: function() {
    var timeline = this;
    var tree = timeline.getLefthandTree();
    var chart = timeline.getUiRoot().find('.tl-chart');

    chart.css({'display': 'none'});

    var width = timeline.getWidth();
    var height = timeline.getHeight();

    // clear and resize
    timeline.paper.clear();
    timeline.paper.setSize(width, height);

    timeline.defer(function() {
      // rebuild content
      timeline.rebuildBackground(tree, width, height);
      chart.css({'display': 'block'});
      timeline.rebuildForeground(tree);
    });
  },
  finishGraph: function() {
    var root = this.getUiRoot();
    var info = jQuery('<span class="tl-hidden-info tl-finished"></span>');

    // this will be called asynchronously and finishes up the graph
    // building process.
    this.setupEventHandlers();

    root.append(info);
  },
  rebuildBackground: function(tree, width, height) {
    var beginning = this.getBeginning();
    var scale = this.getScale();
    var end = this.getEnd();
    var deco = this.decoHeight();

    deco--;

    this.paper.rect(0, deco, width, height).attr({
      'fill': '#fff',
      'stroke': '#fff', //
      'stroke-opacity': 0,
      'stroke-width': 0
    });

    // horizontal bar.
    this.paper.path(
      this.psub('M0 #{y}H#{w}', {
        y: deco + 1.5, // the vertical line otherwise overlaps.
        w: width
      })
    );

    // *** beginning decorations ***

    var lastDivider, caption, captionElement, bbox, dividerPath;
    var padding = 2;

    lastDivider = 0;

    var swimlanes = this.getSwimlaneConfiguration();
    var styles = this.getSwimlaneStyles();
    var config = Timeline.ZOOM_SCALES[this.zoomIndex];

    var key, i, left, first, timeline = this;
    var m, x, y;

    var currentStyle = 0, lastOverrideGroup;

    for (i = Timeline.ZOOM_CONFIGURATIONS[config].config.length - 1; i >= 0; i--) {
      key = Timeline.ZOOM_CONFIGURATIONS[config].config[i];
      if (swimlanes.hasOwnProperty(key)) {

        // if the current swimlane has more overrides, we assume a
        // change in quality of the seperation and switch styles to a
        // more solid one. lastOverrideGroup is set to the length of the
        // override-array of the current swimlane.

        if (swimlanes[key].overrides.length > lastOverrideGroup) {
          currentStyle++;
        }
        lastOverrideGroup = swimlanes[key].overrides.length;

        lastDivider = 0;
        dividerPath = '';
        first = true;
        while (lastDivider < width || swimlanes[key].delimiter.compareTo(end) <= 0) {

          caption = swimlanes[key].caption() || '';
          if (caption.length === undefined) {
            caption = caption.toString(); // caption needs to be a string.
          }
          swimlanes[key].next();
          left = timeline.getDaysBetween(beginning, swimlanes[key].delimiter) * scale.day;
          bbox = {height: 8};

          captionElement = timeline.paper.text(0, 0, caption);
          captionElement.attr({
            'font-size': 10
          });

          x = (lastDivider + (left - lastDivider) / 2) - (jQuery(captionElement.node).width() / 16);
          y = (deco - padding);

          captionElement
            .translate(x, y)
            .attr({
              'fill': styles[currentStyle].textColor || timeline.DEFAULT_COLOR,
              'stroke': 'none'
            });

          lastDivider = left;
          dividerPath += timeline.psub('M#{x} #{y}v#{b} M#{x} #{d}v#{h}', {
            x: left,
            y: deco - bbox.height - 2 * padding,
            h: height,
            b: bbox.height + 2 * padding,
            d: timeline.decoHeight() + 1
          });
        }

        timeline.paper.path(dividerPath).attr({
          'stroke': styles[currentStyle].laneColor || timeline.DEFAULT_LANE_COLOR,
          'stroke-width': styles[currentStyle].laneWidth || timeline.DEFAULT_LANE_WIDTH,
          'stroke-linecap': 'butt' // the vertical line otherwise overlaps.
        });

        // altered deco ceiling for next decorations.
        deco -= bbox.height + 2 * padding;

        // horizontal bar.
        timeline.paper.path(
          timeline.psub('M0 #{y}H#{w}', {
            y: deco + 0.5, // the vertical line otherwise overlaps.
            w: width
          })
        ).attr({
          'stroke': '#000000'
        });
      }
    }

    this.frameLine();
    this.nowLine();
  },
  previousRelativeVerticalOffset: 0,
  previousRelativeVerticalOffsetParameter: undefined,
  getRelativeVerticalOffset: function(offset) {
    if (offset === this.previousRelativeVerticalOffsetParameter) {
      return this.previousRelativeVerticalOffset;
    }
    var result = parseInt(offset.attr("data-vertical-offset"), 10);
    if (isNaN(result)) {
      if (this.table_offset === undefined) {
        result = this.table_offset = this.getUiRoot().find('.tl-left-main table').position().top;
      }

      result = offset.position().top - this.table_offset;

      if (!jQuery.browser.webkit) {
        result -= 1;
      }

      offset.attr("data-vertical-offset", result);
    }

    this.previousRelativeVerticalOffset = result;
    this.previousRelativeVerticalOffsetParameter = offset;
    return result;
  },
  previousRelativeVerticalBottomOffset: 0,
  previousRelativeVerticalBottomOffsetParameter: undefined,
  getRelativeVerticalBottomOffset: function(offset) {
    if (offset === this.previousRelativeVerticalBottomOffsetParameter) {
      return this.previousRelativeVerticalBottomOffset;
    }
    var result = parseInt(offset.attr("data-vertical-bottom-offset"), 10);
    if (isNaN(result)) {
      result = this.getRelativeVerticalOffset(offset);
      if (offset.find("div").length === 1) {
        result -= jQuery(offset.find("div")[0]).height();
      }
      result += offset.outerHeight();
      offset.attr("data-vertical-bottom-offset", result);
    }
    this.previousRelativeVerticalBottomOffset = result;
    this.previousRelativeVerticalBottomOffsetParameter = offset;
    return result;
  },
  rebuildForeground: function(tree) {
    var timeline = this;
    var previousGrouping = -1;
    var grouping;
    var width = timeline.getWidth();
    var previousNode;
    var render_buckets = [[], [], [], []];
    var render_bucket_vertical = render_buckets[0];
    var render_bucket_element = render_buckets[1];
    var render_bucket_vertical_milestone = render_buckets[2];
    var render_bucket_text = render_buckets[3];

    // iterate over all planning elements and find vertical ones to draw.
    jQuery.each(timeline.verticalPlanningElementIds(), function (i, e) {
      var pl = timeline.getPlanningElement(e);

      // the planning element should have been loaded already. however,
      // it might not have been, or it might not even exist. in that
      // case, we simply ignore it.
      if (pl === undefined) {
        return;
      }

      var pet = pl.getPlanningElementType();

      var node = Object.create(Timeline.TreeNode);
      node.setData(pl);

      if (pl.vertical) {
        if (pet && pet.is_milestone) {
          render_bucket_vertical_milestone.push(function () {
            pl.renderVertical(node);
          });
        } else {
          render_bucket_vertical.push(function () {
            pl.renderVertical(node);
          });
        }
      }
    });

    tree.iterateWithChildren(function(node, indent, index) {
      var currentElement = node.getDOMElement();
      var currentOffset = timeline.getRelativeVerticalOffset(currentElement);
      var previousElement, previousEnd, groupHeight;
      var groupingChanged = false;
      var pl = node.getData();

      // if the grouping changed, put a grey box here.

      if (timeline.isGrouping() && indent === 0 && pl.is(Timeline.Project)) {
        grouping = pl.getFirstLevelGrouping();
        if (previousGrouping !== grouping) {

          groupingChanged = true;

          // previousEnd is the vertical position at which a previous
          // element ended. It is calculated by adding the previous
          // element's vertical offset to it's height.

          if (previousNode !== undefined) {
            previousElement = previousNode.getDOMElement();
            previousEnd = timeline.getRelativeVerticalOffset(previousElement) +
                previousElement.outerHeight();
          } else {

            previousEnd = timeline.decoHeight();
          }

          // groupHeight is the height gap between the vertical position
          // at which the current element begins (currentOffset) and the
          // position the previous element ended (previousEnd).

          groupHeight = currentOffset - previousEnd;

          // draw grey box.

          timeline.paper.rect(
            Timeline.GROUP_BAR_INDENT,
            previousEnd,
            width - 2 * Timeline.GROUP_BAR_INDENT,
            groupHeight
          ).attr({
            'fill': '#bbb',
            'fill-opacity': 0.5,
            'stroke-width': 1,
            'stroke-opacity': 1,
            'stroke': Timeline.DEFAULT_STROKE_COLOR
          });

          previousGrouping = grouping;
        }

      }

      // if there is a new project, draw a black line.

      if (pl.is(Timeline.Project)) {

        if (!groupingChanged) {

          // draw lines between projects
          timeline.paper.path(
            timeline.psub('M0 #{y}h#{w}', {
              y: currentOffset + 0.5,
              w: width
            })
          ).attr({
            'stroke-width': 1,
            'stroke': Timeline.DEFAULT_STROKE_COLOR
          });

        }

      } else if (pl.is(Timeline.PlanningElement)) {

      }

      previousNode = node;

      if (pl.is(Timeline.PlanningElement)) {
        render_bucket_text.push(function () {
          pl.renderForeground(node);
        });
      }

      render_bucket_element.push(function() {
        pl.render(node);
      });
    });

    var buckets = Array.prototype.concat.apply([], render_buckets);

    var render_next_bucket = function() {
      if (buckets.length !== 0) {
        jQuery.each(buckets.splice(0, Timeline.RENDER_BUCKET_SIZE), function(i, e) {
          e.call();
        });
        timeline.defer(render_next_bucket);
      } else {
        timeline.finishGraph();
      }
    };

    render_next_bucket();
  },

  frameLine: function () {
    var timeline = this;
    var scale = timeline.getScale();
    var beginning = timeline.getBeginning();
    var decoHeight = timeline.decoHeight();
    var linePosition;

    this.calculateTimeFilter();

    if (this.frameStart) {
      linePosition = (timeline.getDaysBetween(beginning, this.frameStart)) * scale.day;

      timeline.paper.path(
        timeline.psub("M#{position} #{top}L#{position} #{height}", {
          'position': linePosition,
          'top': decoHeight,
          'height': this.getHeight()
        })
      ).attr({
        'stroke': 'blue',
        'stroke-dasharray': '4,3'
      });
    }

    if (this.frameEnd) {
      linePosition = ((timeline.getDaysBetween(beginning, this.frameEnd) + 1) * scale.day);

      timeline.paper.path(
        timeline.psub("M#{position} #{top}L#{position} #{height}", {
          'position': linePosition,
          'top': decoHeight,
          'height': this.getHeight()
        })
      ).attr({
        'stroke': 'blue',
        'stroke-dasharray': '4,3'
      });
    }
  },

  nowLine: function () {
    var timeline = this;
    var scale = timeline.getScale();
    var beginning = timeline.getBeginning();
    var ms_in_a_day = 86400000; // 24 * 60 * 60 * 1000

    var todayPosition = (timeline.getDaysBetween(beginning, Date.today())) * scale.day;
    todayPosition += (Date.now() - Date.today()) / ms_in_a_day * scale.day;

    var decoHeight = timeline.decoHeight();

    var currentTimeElement = timeline.paper.path(
      timeline.psub("M#{today} #{top}L#{today} #{height}", {
        'today': todayPosition,
        'top': decoHeight,
        'height': this.getHeight()
      })
    ).attr({
      'stroke': 'red',
      'stroke-dasharray': '4,3'
    });

    var setDateTime = 5 * 60 * 1000;

    var setDate = function () {
      var newTodayPosition = (timeline.getDaysBetween(beginning, Date.today())) * scale.day;
      newTodayPosition += (Date.now() - Date.today()) / ms_in_a_day * scale.day;

      if (Math.abs(newTodayPosition - todayPosition) > 0.1) {
        currentTimeElement.transform(
          timeline.psub("t#{trans},0", {
            'trans': newTodayPosition - todayPosition
          })
        );
      }

      if (scale.day === timeline.getScale().day) {
        window.setTimeout(setDate, setDateTime);
      }
    };

    window.setTimeout(setDate, setDateTime);
  },

  adjustTooltip: function(renderable, element) {
    renderable = renderable || this.currentNode;
    element = element || this.currentElement;
    if (!renderable) {
      return;
    }

    var chart = this.getChart();
    var offset = chart.position();
    var tooltip = this.getTooltip();
    var bbox = element.getBBox();
    var content = tooltip.find('.tl-tooltip-inner');
    var arrow = tooltip.find('.tl-tooltip-arrow');
    var arrowOffset = this.pnum(arrow.css('left'));
    var padding = (tooltip.outerWidth() - tooltip.width()) / 2;
    var duration = tooltip.css('display') !== 'none' ? 0 : 0;
    var info = "";
    var r = renderable.getResponsible();

    // construct tooltip content information.

    info += "<b>";
    info += this.escape(renderable.subject);
    info += "</b>";
    if (renderable.is(Timeline.PlanningElement)) {
      info += " (#" + renderable.id + ")";
    }
    info += "<br/>";
    info += this.escape(renderable.start_date);
    if (renderable.due_date !== renderable.start_date) {
      // only have a second date if it is different.
      info += " – " + this.escape(renderable.due_date);
    }
    info += "<br/>";
    if (r && r.name) { // if there is a responsible, show the name.
      info += r.name;
    }

    content.html(info);

    // calculate position of tooltip
    var left = offset.left;
    left -= chart.scrollLeft();
    left += bbox.x;
    if (renderable.start_date && renderable.due_date) {
      left += bbox.width / 2;
    } else if (renderable.due_date) {
      left += bbox.width - Timeline.HOVER_THRESHOLD;
    } else {
      left += Timeline.HOVER_THRESHOLD;
    }
    left -= arrowOffset;

    var min_left = this.getUiRoot().find('.tl-left').position().left;
    min_left += this.getUiRoot().find('.tl-left').width();
    min_left -= arrowOffset;

    var max_left = this.getUiRoot().find('.tl-right').position().left;
    max_left -= tooltip.outerWidth();
    max_left -= padding;
    max_left += arrowOffset;

    left = Math.max(min_left, Math.min(max_left, left));

    var margin = offset.left;
    margin -= chart.scrollLeft();
    margin += (bbox.x);
    if (renderable.start_date && renderable.due_date) {
      margin += bbox.width / 2;
    } else if (renderable.due_date) {
      margin += bbox.width - Timeline.HOVER_THRESHOLD;
    } else {
      margin += Timeline.HOVER_THRESHOLD;
    }
    margin -= left;
    margin -= arrowOffset;

    var max_margin = tooltip.width();
    max_margin -= padding;
    max_margin -= arrowOffset;

    margin = Math.min(max_margin, Math.max(margin, 0));
    margin -= padding;

    var top = offset.top;
    top += bbox.y;
    top -= tooltip.outerHeight();
    top--; // random offset.

    if (top < jQuery(window).scrollTop() - 80) {
      top = jQuery(window).scrollTop() - 80;
    }

    this.currentNode = renderable;
    this.currentElement = element;
    tooltip.clearQueue();
    arrow.clearQueue();

    tooltip.animate({left: left, top: top}, duration, 'swing');
    arrow.animate({'margin-left': margin}, duration, 'swing');
  },

  setupEventHandlers: function() {
    var tree = this.getLefthandTree();
    this.setupResizeHandlers();
    //this.setupHoverHandlers(tree);
  },
  setupResizeHandlers: function() {
    var timeline = this, timeout;
    var handler_name = 'resize.' + timeline.getEventHandlerSuffix();

    jQuery(window).unbind(handler_name);
    jQuery(window).bind(handler_name, function() {

      window.clearTimeout(timeout);
      timeout = window.setTimeout(function() {
        timeline.triggerResize();
      }, 1087); // http://dilbert.com/strips/comic/2008-05-08/
    });
  },
  triggerResize: function() {
    var root = this.getUiRoot();
    var width = root.width() - root.find('.tl-left-main').width() -
                  Timeline.BORDER_WIDTH_CORRECTION;
    this.adjustWidth(width);
  },
  addHoverHandler: function(node, e) {
    var tooltip = this.getTooltip();
    var timeline = this;

    e.unhover();
    e.click(function(e) {
      if (Timeline.USE_MODALS) {
        var payload = node.getData();
        timeline.modalHelper.createModal(payload.getUrl());
        e.stopPropagation();
      }
    });
    e.attr({'cursor': 'pointer'});
    e.hover(
      function() {
        timeline.adjustTooltip(node.getData(), e);
        tooltip.show();
      },
      function() {
        delete tooltip.currentNode;
        delete tooltip.currentElement;
        tooltip.hide();
      },
      node, node
    );
  },

  addPlanningElement: function() {
    var projects = this.projects;
    var project, projectID, possibleProjects = [];

    for (project in projects) {
      if (projects.hasOwnProperty(project)) {
        possibleProjects.push(projects[project]);
      }
    }

    projectID = possibleProjects[0].identifier;

    if (typeof projectID !== "undefined") {
      this.modalHelper.create(projectID);
    }
  }
});
