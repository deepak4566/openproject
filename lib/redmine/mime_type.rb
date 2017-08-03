#-- encoding: UTF-8

#-- copyright
# OpenProject is a project management system.
# Copyright (C) 2012-2017 the OpenProject Foundation (OPF)
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License version 3.
#
# OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
# Copyright (C) 2006-2017 Jean-Philippe Lang
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

module Redmine
  module MimeType
    MIME_TYPES = {
      'text/plain' => 'txt,tpl,properties,patch,diff,ini,readme,install,upgrade',
      'text/css' => 'css',
      'text/html' => 'html,htm,xhtml',
      'text/jsp' => 'jsp',
      'text/x-c' => 'c,cpp,cc,h,hh',
      'text/x-csharp' => 'cs',
      'text/x-java' => 'java',
      'text/x-javascript' => 'js',
      'text/x-html-template' => 'rhtml',
      'text/x-perl' => 'pl,pm',
      'text/x-php' => 'php,php3,php4,php5',
      'text/x-python' => 'py',
      'text/x-ruby' => 'rb,rbw,ruby,rake,erb',
      'text/x-csh' => 'csh',
      'text/x-sh' => 'sh',
      'text/xml' => 'xml,xsd,mxml',
      'text/yaml' => 'yml,yaml',
      'text/csv' => 'csv',
      'text/x-po' => 'po',
      'image/gif' => 'gif',
      'image/jpeg' => 'jpg,jpeg,jpe',
      'image/png' => 'png',
      'image/tiff' => 'tiff,tif',
      'image/x-ms-bmp' => 'bmp',
      'image/x-xpixmap' => 'xpm',
      'application/pdf' => 'pdf',
      'application/rtf' => 'rtf',
      'application/msword' => 'doc',
      'application/vnd.ms-excel' => 'xls',
      'application/vnd.ms-powerpoint' => 'ppt,pps',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow' => 'ppsx',
      'application/vnd.oasis.opendocument.spreadsheet' => 'ods',
      'application/vnd.oasis.opendocument.text' => 'odt',
      'application/vnd.oasis.opendocument.presentation' => 'odp',
      'application/x-7z-compressed' => '7z',
      'application/x-rar-compressed' => 'rar',
      'application/x-tar' => 'tar',
      'application/zip' => 'zip',
      'application/x-gzip' => 'gz',
      'video/x-flv' => 'flv,f4v',
      'video/mpeg' => 'mpeg,mpg,mpe',
      'video/mp4' => 'mp4',
      'video/x-ms-wmv' => 'wmv',
      'video/quicktime' => 'qt,mov',
      'video/vnd.vivo' => 'viv,vivo',
      'video/x-msvideo' => 'avi'
    }.freeze

    EXTENSIONS = MIME_TYPES.inject({}) { |map, (type, exts)|
      exts.split(',').each do |ext| map[ext.strip] = type end
      map
    }

    # returns mime type for name or nil if unknown
    def self.of(name)
      return nil unless name
      m = name.to_s.match(/(\A|\.)([^\.]+)\z/)
      EXTENSIONS[m[2].downcase] if m
    end

    # Returns the css class associated to
    # the mime type of name
    def self.css_class_of(name)
      mime = of(name)
      mime && mime.gsub('/', '-')
    end

    def self.main_mimetype_of(name)
      mimetype = of(name)
      mimetype.split('/').first if mimetype
    end

    # return true if mime-type for name is type/*
    # otherwise false
    def self.is_type?(type, name)
      main_mimetype = main_mimetype_of(name)
      type.to_s == main_mimetype
    end

    def self.narrow_type(name, content_type)
      (content_type.split('/').first == main_mimetype_of(name)) ? of(name) : content_type
    end
  end
end
