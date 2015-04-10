//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
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

window.CS = window.CS || {};

jQuery(function($) {
  var regions = $.datepicker.regional;
  var regional = regions[CS.lang] || regions[""];
  $.datepicker.setDefaults(regional);

  var gotoToday = $.datepicker._gotoToday;

  $.datepicker._gotoToday = function (id) {
    gotoToday.call(this, id);
    var target = $(id),
      inst = this._getInst(target[0]),
      dateStr = $.datepicker._formatDate(inst);
    target.val(dateStr);
    target.blur();
    $.datepicker._hideDatepicker();
  };

  var defaults = {
    showWeek: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "c-100:c+10",
    dateFormat: 'yy-mm-dd',
    showButtonPanel: true,
    calculateWeek: function (day) {
      var dayOfWeek = new Date(+day);

      if (day.getDay() != 1) {
        dayOfWeek.setDate(day.getDate() - day.getDay() + 1);
      }

      return $.datepicker.iso8601Week(dayOfWeek);
    }
  };

  if (CS.firstWeekDay && CS.firstWeekDay !== "") {
    defaults.firstDay = parseInt(CS.firstWeekDay, 10);
  }

  $.datepicker.setDefaults(defaults);
});
