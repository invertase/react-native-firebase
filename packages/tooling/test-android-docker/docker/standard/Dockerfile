FROM openjdk:8-slim

# Default environment variables
ENV BUILD_THREADS=1
ENV ADB_INSTALL_TIMEOUT=10
ENV ANDROID_HOME=/opt/android
ENV ANDROID_SDK_HOME=${ANDROID_HOME}
ENV _JAVA_OPTIONS="-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -Xmx750m"
ENV GRADLE_OPTS='-Dorg.gradle.daemon=false -Dorg.gradle.jvmargs="-XX:+HeapDumpOnOutOfMemoryError -Xmx750m"'

# Add tools to path
ENV PATH=${PATH}:/opt/buck/bin/
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools

# install system dependencies
RUN apt-get update -qq && apt-get install -qq -y --no-install-recommends \
        apt-transport-https \
        curl \
        file \
        git \
        gnupg2 \
        qemu-kvm \
        libvirt-clients \
        libguestfs-tools \
        libvirt-daemon-system \
        bridge-utils \
        virtinst \
        libosinfo-bin \
        openjdk-8-jre \
        python \
        unzip \
    && rm -rf /var/lib/apt/lists/*;

ARG NODE_MAJOR_VERSION=10
RUN echo "deb https://deb.nodesource.com/node_${NODE_MAJOR_VERSION}.x stretch main" > /etc/apt/sources.list.d/nodesource.list \
    && echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
    && curl -sS https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - \
    && apt-get update -qq \
    && apt-get install -qq -y --no-install-recommends nodejs yarn \
    && rm -rf /var/lib/apt/lists/* \
    && yarn global add firebase-tools

# See https://developer.android.com/studio/
ARG SDK_TOOLS_VERSION=4333796
RUN curl -sS https://dl.google.com/android/repository/sdk-tools-linux-${SDK_TOOLS_VERSION}.zip -o /tmp/sdk.zip \
    && mkdir /opt/android \
    && unzip -q -d /opt/android /tmp/sdk.zip \
    && rm /tmp/sdk.zip

# Add default SDKs
RUN yes | sdkmanager --licenses && sdkmanager --update
RUN sdkmanager "platform-tools" \
    "extras;android;m2repository"

ARG ANDROID_COMPILE_SDK_VERSION=27
RUN sdkmanager "platforms;android-$ANDROID_COMPILE_SDK_VERSION"

ARG ANDROID_BUILD_TOOLS_VERSION=28.0.2
RUN sdkmanager "build-tools;$ANDROID_BUILD_TOOLS_VERSION"

#ARG EMULATOR_API=25
#ENV AVD_PACKAGE="system-images;android-${EMULATOR_API};google_apis;armeabi-v7a"
#RUN sdkmanager "${AVD_PACKAGE}" "emulator"
#
#ARG AVD_NAME="TestingAVD"
#ENV AVD_NAME="${AVD_NAME}"
#RUN  mkdir -p ~/.android \
#     && touch ~/.android/repositories.cfg \
#     && echo no | avdmanager create avd --name "$AVD_NAME" --device "Nexus 5X" --force --package "$AVD_PACKAGE" --tag google_apis --abi "armeabi-v7a"

COPY scripts /opt/scripts
ENV PATH=${PATH}:/opt/scripts/

#RUN avd-launch \
#    && avd-wait-ready \
#    && avd-snapshot

# Detox patch
#RUN adb start-server \
#    && adb kill-server \
#    && cp -R ~/.android/. /opt/android/.android/. \
#    && mkdir -p ~/.android/avd/$AVD_NAME.avd \
#    && echo "hw.lcd.height=1920" >> /opt/android/.android/avd/$AVD_NAME.avd/config.ini \
#    && echo "hw.lcd.width=1080" >> /opt/android/.android/avd/$AVD_NAME.avd/config.ini \
#    && cp /opt/android/.android/avd/$AVD_NAME.avd/config.ini ~/.android/avd/$AVD_NAME.avd/config.ini

RUN rm -rf /opt/android/.android/cache
#RUN adduser root libvirt && adduser root libvirt-qemu
