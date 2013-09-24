#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2013 the OpenProject Foundation (OPF)
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
# See doc/COPYRIGHT.rdoc for more details.
#++

class Group < Principal
  has_many :group_users
  has_many :users, :through => :group_users,
                   :after_add => :user_added,
                   :after_remove => :user_removed

  acts_as_customizable

  validates_presence_of :lastname
  validates_uniqueness_of :lastname, :case_sensitive => false
  validates_length_of :lastname, :maximum => 30

  before_destroy :remove_references_before_destroy

  def to_s
    lastname.to_s
  end

  alias :name :to_s

  def user_added(user)
    members.each do |member|
      next if member.project.nil?

      user_member = Member.find_by_project_id_and_user_id(member.project_id, user.id)

      if user_member.nil?
        user_member = Member.new.tap do |m|
          m.project_id = member.project_id
          m.user_id = user.id
        end

        member.member_roles.each do |member_role|
          user_member.add_role(member_role.role, member_role.id)
        end

        user_member.save!
      else
        member.member_roles.each do |member_role|
          user_member.add_and_save_role(member_role.role, member_role.id)
        end
      end
    end
  end

  def user_removed(user)
    members.each do |member|
      MemberRole.find(:all,
        :include => :member,
        :conditions =>
          ["#{Member.table_name}.user_id = ? AND #{MemberRole.table_name}.inherited_from IN (?)",
            user.id, member.member_role_ids]).each do |member_role|
              member_role.member.remove_member_role_and_destroy_member_if_last(member_role)
            end
    end
  end

  # adds group members
  # meaning users that are members of the group
  def add_member!(users)
    self.users << users
  end

  private

  # Removes references that are not handled by associations
  def remove_references_before_destroy
    return if self.id.nil?

    deleted_user = DeletedUser.first

    WorkPackage.update_all({ :assigned_to_id => deleted_user.id },
                           { :assigned_to_id => id })

    Journal::WorkPackageJournal.update_all({ :assigned_to_id => deleted_user.id },
                                           { :assigned_to_id => id })
  end
end
