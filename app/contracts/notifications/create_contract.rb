#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2021 the OpenProject GmbH
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
# See docs/COPYRIGHT.rdoc for more details.
#++

module Notifications
  class CreateContract < ::ModelContract
    attribute :recipient
    attribute :subject
    attribute :reason
    attribute :project
    attribute :actor
    attribute :resource
    attribute :journal
    attribute :resource_type
    attribute :read_ian
    attribute :read_email

    validate :validate_recipient_present
    validate :validate_subject_present
    validate :validate_reason_present
    validate :validate_channels

    def validate_recipient_present
      errors.add(:recipient, :blank) if model.recipient.blank?
    end

    def validate_subject_present
      errors.add(:subject, :blank) if model.subject.blank?
    end

    def validate_reason_present
      errors.add(:reason, :blank) if model.reason.blank?
    end

    def validate_channels
      if model.read_ian == nil && model.read_email == nil
        errors.add(:base, :at_least_one_channel)
      end

      if model.read_ian
        errors.add(:read_ian, :read_on_creation)
      end

      if model.read_email
        errors.add(:read_email, :read_on_creation)
      end
    end
  end
end
