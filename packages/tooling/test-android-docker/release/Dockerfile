FROM invertase/react-native-firebase-android:debug

ARG NODE_MAJOR_VERSION=10
RUN echo "deb https://deb.nodesource.com/node_${NODE_MAJOR_VERSION}.x stretch main" > /etc/apt/sources.list.d/nodesource.list \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
    && curl -sS https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && apt-get update -qq \
    && apt-get install -qq -y --no-install-recommends nodejs yarn \
    &&  apt-get clean \
    && rm -rf /var/lib/apt/lists/*
