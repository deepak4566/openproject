FROM ruby:2.5-stretch

ENV NODE_VERSION="8.11.1"
ENV BUNDLER_VERSION="1.16.2"
ENV APP_USER app
ENV APP_PATH /usr/src/app
ENV APP_DATA /var/db/openproject
ENV ATTACHMENTS_STORAGE_PATH /var/db/openproject/files

# install node + npm
RUN curl https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz | tar xzf - -C /usr/local --strip-components=1

RUN apt-get update -qq && \
	DEBIAN_FRONTEND=noninteractive apt-get install -y  \
	postgresql-client \
    	mysql-client \
    	sqlite \
	poppler-utils \
	unrtf \
	tesseract-ocr \
	catdoc && \
	apt-get clean && rm -rf /var/lib/apt/lists/*

# using /home/app since npm cache and other stuff will be put there when running npm install
# we don't want to pollute any locally-mounted directory
RUN useradd -d /home/$APP_USER -m $APP_USER
RUN mkdir -p $APP_PATH $APP_DATA
RUN gem install bundler --version "${bundler_version}"

WORKDIR $APP_PATH

COPY Gemfile ./Gemfile
COPY Gemfile.* ./
COPY modules ./modules
# OpenProject::Version is required by module versions in gemspecs
RUN mkdir -p lib/open_project
COPY lib/open_project/version.rb ./lib/open_project/
RUN bundle install --deployment --with="docker opf_plugins" --without="test development" --jobs=8 --retry=3

# Then, npm install node modules
COPY package.json /tmp/npm/package.json
COPY frontend/*.json /tmp/npm/frontend/
RUN cd /tmp/npm/frontend/ && RAILS_ENV=production npm install && mv /tmp/npm/frontend /usr/src/app/

# Finally, copy over the whole thing
COPY . /usr/src/app
RUN cp docker/Procfile .
RUN sed -i "s|Rails.groups(:opf_plugins)|Rails.groups(:opf_plugins, :docker)|" config/application.rb

# Re-use packager database.yml
COPY packaging/conf/database.yml ./config/database.yml

# Run the npm postinstall manually after it was copied
RUN DATABASE_URL=sqlite3:///tmp/db.sqlite3 SECRET_TOKEN=foobar RAILS_ENV=production bundle exec rake assets:precompile

# Include pandoc
RUN DATABASE_URL=sqlite3:///tmp/db.sqlite3 RAILS_ENV=production bundle exec rails runner "puts ::OpenProject::TextFormatting::Formats::Markdown::PandocDownloader.check_or_download!"

CMD ["./docker/web"]
ENTRYPOINT ["./docker/entrypoint.sh"]
VOLUME ["$APP_DATA"]
