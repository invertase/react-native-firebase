FROM openjdk:8-slim

RUN apt-get update && \
	apt-get install -y --no-install-recommends openjdk-8-jre && \
	apt-get install -y --no-install-recommends ant && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
	rm -rf /var/cache/oracle-jre8-installer

# Default environment variables
ENV BUILD_THREADS=4
ENV ADB_INSTALL_TIMEOUT=10
ENV ANDROID_HOME=/opt/android
ENV ANDROID_SDK_HOME=${ANDROID_HOME}
ENV _JAVA_OPTIONS="-XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -Xmx2048m"
ENV GRADLE_OPTS='-Dorg.gradle.daemon=false -Dorg.gradle.jvmargs="-XX:+HeapDumpOnOutOfMemoryError -Xmx2048m"'
ENV PATH=${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools

# install system dependencies
RUN apt-get update -qq && apt-get install -qq -y --no-install-recommends \
        apt-transport-https \
        curl \
        file \
        git \
        gnupg2 \
        python \
        unzip \
    &&  apt-get clean \
    && rm -rf /var/lib/apt/lists/*;

# See https://developer.android.com/studio/
ARG SDK_TOOLS_VERSION=4333796
RUN curl -sS https://dl.google.com/android/repository/sdk-tools-linux-${SDK_TOOLS_VERSION}.zip -o /tmp/sdk.zip \
    && mkdir /opt/android \
    && unzip -q -d /opt/android /tmp/sdk.zip \
    && rm /tmp/sdk.zip

# Add default SDKs
ARG ANDROID_COMPILE_SDK_VERSION=27
ARG ANDROID_BUILD_TOOLS_VERSION=28.0.2
RUN yes | sdkmanager --licenses && sdkmanager --update
RUN sdkmanager "platform-tools" "extras;android;m2repository" \
    "platforms;android-$ANDROID_COMPILE_SDK_VERSION" \
    "build-tools;$ANDROID_BUILD_TOOLS_VERSION" \
    && rm -rf /opt/android/.android/cache
