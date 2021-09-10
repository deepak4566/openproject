#-- encoding: UTF-8

#-- copyright
# OpenProject is an open source project management software.
# Copyright (C) 2012-2020 the OpenProject GmbH
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

require 'spec_helper'

describe Attachments::PrepareUploadService,
         'integration' do
  shared_let(:container) { FactoryBot.create(:work_package) }
  shared_let(:user) do
    FactoryBot.create :user,
                      member_in_project: container.project,
                      member_with_permissions: %i[view_work_packages edit_work_packages]
  end
  let(:instance) { described_class.new(user: user) }

  let(:file_size) { 6 }
  let(:file_name) { 'document.png' }
  let(:content_type) { "application/octet-stream" }

  let(:call) do
    instance.call filename: file_name,
                  container: container,
                  content_type: content_type,
                  filesize: file_size
  end

  let(:attachment) { call.result }

  it 'returns the attachment' do
    expect(attachment)
      .to be_a(Attachment)
  end

  it 'sets the content_type' do
    expect(attachment.content_type)
      .to eql content_type
  end

  it 'sets the file_size' do
    expect(attachment.filesize)
      .to eql file_size
  end

  it 'sets the file for carrierwave' do
    expect(attachment.file.file.path)
      .to end_with "attachment/file/#{attachment.id}/#{file_name}"
  end

  it 'sets the author' do
    expect(attachment.author)
      .to eql user
  end

  it 'sets the digest to empty string' do
    expect(attachment.digest)
      .to eql ""
  end

  it 'sets the download count to -1' do
    expect(attachment.downloads)
      .to eql -1
  end

  context 'with a special character in the filename' do
    let(:file_name) { "document=number 5.png" }

    it 'sets the file for carrierwave' do
      expect(attachment.file.file.path)
        .to end_with "attachment/file/#{attachment.id}/document_number_5.png"
    end
  end
end
