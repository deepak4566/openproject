#-- copyright
# OpenProject Backlogs Plugin
#
# Copyright (C)2013-2014 the OpenProject Foundation (OPF)
# Copyright (C)2011 Stephan Eckardt, Tim Felgentreff, Marnen Laibow-Koser, Sandro Munda
# Copyright (C)2010-2011 friflaj
# Copyright (C)2010 Maxime Guilbot, Andrew Vit, Joakim Kolsjö, ibussieres, Daniel Passos, Jason Vasquez, jpic, Emiliano Heyns
# Copyright (C)2009-2010 Mark Maglana
# Copyright (C)2009 Joe Heck, Nate Lowrie
#
# This program is free software; you can redistribute it and/or modify it under
# the terms of the GNU General Public License version 3.
#
# OpenProject Backlogs is a derivative work based on ChiliProject Backlogs.
# The copyright follows:
# Copyright (C) 2010-2011 - Emiliano Heyns, Mark Maglana, friflaj
# Copyright (C) 2011 - Jens Ulferts, Gregor Schmidt - Finn GmbH - Berlin, Germany
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# See doc/COPYRIGHT.rdoc for more details.
#++

module BurndownChartsHelper
  def yaxis_labels(burndown)
    max = burndown.max[:points]

    mvalue = (max / 25) + 1

    labels = (0..mvalue).map { |i| "[#{i * 25}, #{i * 25}]" }

    mvalue = mvalue + 1 if mvalue == 1 || ((max % 25) == 0)

    labels << "[#{(mvalue) * 25}, '<span class=\"axislabel\">#{l('backlogs.points')}</span>']"

    result = labels.join(', ')

    result.html_safe
  end

  def xaxis_labels(burndown)
    # 14 entries (plus the axis label) have come along as the best value for a good optical result.
    # Thus it is enough space between the entries.
    entries_displayed = (burndown.days.length / 14.0).ceil
    result = burndown.days.enum_for(:each_with_index).map do |d, i|
      if ((i % entries_displayed) == 0)
        "[#{i + 1}, '#{escape_javascript(::I18n.t('date.abbr_day_names')[d.wday % 7])} #{d.strftime('%d/%m')}']"
      end
    end.join(',').html_safe +
      ", [#{burndown.days.length + 1},
       '<span class=\"axislabel\">#{I18n.t('backlogs.date')}</span>']".html_safe
  end

  def dataseries(burndown)
    dataset = {}
    burndown.series.each do |s|
      dataset[s.first] = {
        label: l('backlogs.' + s.first.to_s),
        data: s.last.enum_for(:each_with_index).map { |val, i| [i + 1, val] }
      }
    end

    dataset
  end

  def burndown_series_checkboxes(burndown)
    boxes = ''
    burndown.series(:all).map { |s| s.first.to_s }.sort.each do |series|
      boxes += "<input class=\"series_enabled\" type=\"checkbox\" id=\"#{series}\" name=\"#{series}\" value=\"#{series}\" checked>#{l('backlogs.' + series.to_s)}<br/>"
    end
    boxes.html_safe
  end
end
