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
module OpenProject::GithubIntegration::Services
  ##
  # Takes pull request data coming from GitHub webhook data and stores
  # them as a `GithubPullRequest`.
  # issue_comments webhooks don't give us the full PR data, but just a html_url.
  # As described in [the docs](https://docs.github.com/en/rest/reference/issues#list-organization-issues-assigned-to-the-authenticated-user),
  # pull request are considered to also be issues
  #
  # Returns the upserted partial `GithubPullRequest`.
  class UpsertPartialPullRequest
    def call(github_html_url:, number:, repository:, work_packages:)
      pull_request = find_full(github_html_url)

      if pull_request.present?
        pull_request.update!(work_packages: pull_request.work_packages | work_packages)
      else
        find_or_initialize_partial(github_html_url).tap do |pr|
          pr.update!(
            number: number,
            repository: repository,
            work_packages: pr.work_packages | work_packages
          )
        end
      end
    end

    private

    def find_full(github_html_url)
      GithubPullRequest.complete.find_by(github_html_url: github_html_url)
    end

    def find_or_initialize_partial(github_html_url)
      GithubPullRequest.partial.find_or_initialize_by(github_html_url: github_html_url)
    end
  end
end
