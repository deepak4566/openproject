#!/bin/bash
#-- encoding: UTF-8
#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
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

# script/ci_setup.sh

# $1 = TEST_SUITE
# $2 = DB

run() {
  echo $1;
  eval $1;

  echo $2;
  eval $2;
}

if [ $2 = "mysql" ]; then
  run "mysql -u root -e \"CREATE DATABASE IF NOT EXISTS travis_ci_test DEFAULT CHARACTER SET = 'utf8' DEFAULT COLLATE 'utf8_general_ci';\""
  run "mysql -u root -e \"GRANT ALL ON travis_ci_test.* TO 'travis'@'localhost';\""
  run "cp script/templates/database.travis.mysql.yml config/database.yml"
elif [ $2 = "postgres" ]; then
  run "psql -c 'create database travis_ci_test;' -U postgres"
  run "cp script/templates/database.travis.postgres.yml config/database.yml"
fi

# run migrations for mysql or postgres
if [ $1 != 'npm' ]; then
  run "bundle exec rake db:migrate"
fi

run "for i in {1..3}; do npm install && break || sleep 15; done"

if [ $1 = 'npm' ]; then
  echo "No asset compilation required"
elif [ $1 != 'specs' ] && [ $1 != 'spec_legacy' ]; then
  run "bundle exec rails assets:precompile"
else
  # fake result of npm/asset run
  run "mkdir -p public/assets/frontend/"
  run "touch public/assets/frontend/runtime.js"
  run "touch public/assets/frontend/vendor.js"
  run "touch public/assets/frontend/main.js"
  run "touch public/assets/frontend/styles.js"
  run "touch public/assets/frontend/styles.css"

  run "mkdir -p app/assets/javascripts/bundles"
  run "touch app/assets/javascripts/bundles/openproject-legacy-app.js"

  run "mkdir -p app/assets/javascripts/locales"
  run "touch app/assets/javascripts/locales/en.js"
fi

