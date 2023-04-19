#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2022 the OpenProject GmbH
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2013 Jean-Philippe Lang
# Copyright (C) 2010-2013 the ChiliProject Team
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
# See COPYRIGHT and LICENSE files for more details.
#++

class Timestamp
  delegate :hash, to: :iso8601

  class Exception < StandardError; end

  class ISO8601Parser
    def initialize(string)
      @iso8601_string = string
    end

    def parse!
      @iso8601_string = self.class.substitute_special_shortcut_values(@iso8601_string)

      if @iso8601_string.start_with? /[+-]?P/ # ISO8601 "Period"
        ActiveSupport::Duration.parse(@iso8601_string).iso8601
      else
        Time.zone.iso8601(@iso8601_string).iso8601
      end
    rescue ArgumentError => e
      raise e.class, "The string \"#{@iso8601_string}\" cannot be parsed to Time or ActiveSupport::Duration."
    end

    class << self
      # rubocop:disable Metrics/AbcSize
      # rubocop:disable Metrics/PerceivedComplexity
      def substitute_special_shortcut_values(string)
        # map now to PT0S
        string = "PT0S" if string == "now"

        # map 1y to P1Y, 1m to P1M, 1w to P1W, 1d to P1D
        # map -1y to P-1Y, -1m to P-1M, -1w to P-1W, -1d to P-1D
        # map -1y1d to P-1Y-1D
        sign = "-" if string.start_with? "-"
        years = scan_for_shortcut_value(string:, unit: "y")
        months = scan_for_shortcut_value(string:, unit: "m")
        weeks = scan_for_shortcut_value(string:, unit: "w")
        days = scan_for_shortcut_value(string:, unit: "d")
        if years || months || weeks || days
          string = "P" \
                   "#{sign if years}#{years}#{'Y' if years}" \
                   "#{sign if months}#{months}#{'M' if months}" \
                   "#{sign if weeks}#{weeks}#{'W' if weeks}" \
                   "#{sign if days}#{days}#{'D' if days}"
        end

        string
      end
      # rubocop:enable Metrics/AbcSize
      # rubocop:enable Metrics/PerceivedComplexity

      def scan_for_shortcut_value(string:, unit:)
        string.scan(/(\d+)#{unit}/).flatten.first
      end
    end
  end

  class << self
    def parse(iso8601_string)
      return iso8601_string if iso8601_string.is_a?(Timestamp)

      iso8601_string = ISO8601Parser.new(iso8601_string.strip).parse!
      new(iso8601_string)
    end

    # Take a comma-separated string of ISO-8601 timestamps and convert it
    # into an array of Timestamp objects.
    #
    def parse_multiple(comma_separated_iso8601_string)
      comma_separated_iso8601_string.to_s.split(",").compact_blank.collect do |iso8601_string|
        Timestamp.parse(iso8601_string)
      end
    end

    def now
      new(ActiveSupport::Duration.build(0).iso8601)
    end
  end

  def initialize(arg = Timestamp.now.to_s)
    if arg.is_a? String
      @timestamp_iso8601_string = ISO8601Parser.substitute_special_shortcut_values(arg)
    elsif arg.respond_to? :iso8601
      @timestamp_iso8601_string = arg.iso8601
    else
      raise Timestamp::Exception,
            "Argument type not supported. " \
            "Please provide an ISO-8601 String or anything that responds to :iso8601, e.g. a Time."
    end
  end

  def relative?
    to_s.first == "P" # ISO8601 "Period"
  end

  def to_s
    iso8601
  end

  def to_str
    to_s
  end

  def iso8601
    @timestamp_iso8601_string.to_s
  end

  def to_iso8601
    iso8601
  end

  def inspect
    "#<Timestamp \"#{iso8601}\">"
  end

  def absolute
    Timestamp.new(to_time)
  end

  def to_time
    if relative?
      Time.zone.now - (to_duration * (to_duration.to_i.positive? ? 1 : -1))
    else
      Time.zone.parse(self)
    end
  end

  def to_duration
    if relative?
      ActiveSupport::Duration.parse(self)
    else
      raise Timestamp::Exception, "This timestamp is absolute and cannot be represented as ActiveSupport::Duration."
    end
  end

  def as_json(*_args)
    to_s
  end

  def to_json(*_args)
    to_s
  end

  def ==(other)
    case other
    when String
      iso8601 == other or to_s == other
    when Timestamp
      iso8601 == other.iso8601
    when NilClass
      to_s.blank?
    else
      raise Timestamp::Exception, "Comparison to #{other.class.name} not implemented, yet."
    end
  end

  def eql?(other)
    self == other
  end

  def historic?
    self != Timestamp.now
  end

  def valid?
    self.class.parse(iso8601)
  rescue StandardError
    false
  end
end
