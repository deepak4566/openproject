#-- encoding: UTF-8

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

require 'spec_helper'

describe Notifications::WorkflowJob, type: :model do
  subject(:perform_job) do
    described_class.new.perform(state, *arguments)
  end

  let(:send_notification) { true }

  let(:notifications) do
    [FactoryBot.build_stubbed(:notification),
     FactoryBot.build_stubbed(:notification)]
  end

  describe '#perform' do
    context 'with the :create_notifications state' do
      let(:state) { :create_notifications }
      let(:arguments) { [resource, send_notification] }
      let(:resource) { FactoryBot.build_stubbed(:comment) }

      let!(:create_service) do
        service_instance = instance_double(Notifications::CreateFromModelService)
        service_result = instance_double(ServiceResult)

        allow(Notifications::CreateFromModelService)
          .to receive(:new)
                .with(resource)
                .and_return(service_instance)

        allow(service_instance)
          .to receive(:call)
                .with(send_notification)
                .and_return(service_result)

        allow(service_result)
          .to receive(:all_results)
                .and_return(notifications)

        service_instance
      end

      it 'calls the service to create notifications' do
        perform_job

        expect(create_service)
          .to have_received(:call)
                .with(send_notification)
      end

      it 'schedules a delayed WorkflowJob' do
        allow(Time)
          .to receive(:current)
                .and_return(Time.current)

        expected_time = Time.current +
                        Setting.notification_email_delay_minutes.minutes +
                        Setting.journal_aggregation_time_minutes.to_i.minutes

        expect { perform_job }
          .to enqueue_job(described_class)
                .with(:send_mails, *notifications.map(&:id))
                .at(expected_time)
      end
    end

    context 'with the :send_mails state' do
      let(:state) { :send_mails }
      let(:arguments) { notifications.map(&:id) }

      let!(:mail_service) do
        service_instance = instance_double(Notifications::MailService,
                                           call: nil)

        allow(Notifications::MailService)
          .to receive(:new)
                .with(notifications.first)
                .and_return(service_instance)

        service_instance
      end

      let!(:digest_job) do
        allow(Mails::DigestJob)
          .to receive(:schedule)
      end

      before do
        scope = class_double(Notification,
                             unread_mail: [notifications.first],
                             unread_mail_digest: [notifications.last])

        allow(Notification)
          .to receive(:where)
                .with(id: notifications.map(&:id))
                .and_return(scope)
      end

      it 'sends mails for all notifications that are marked to send mails' do
        perform_job

        expect(mail_service)
          .to have_received(:call)
      end

      it 'schedules a digest job for all notifications that are marked for the digest' do
        perform_job

        expect(Mails::DigestJob)
          .to have_received(:schedule)
                .with(notifications.last)
      end
    end
  end
end
