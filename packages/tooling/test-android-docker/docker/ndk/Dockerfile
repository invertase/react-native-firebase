FROM invertase/react-native-firebase-android:standard

# download and unpack NDK
ARG NDK_VERSION=17c
ENV ANDROID_NDK=/opt/ndk/android-ndk-r$NDK_VERSION
ENV PATH=${PATH}:${ANDROID_NDK}
RUN curl -sS https://dl.google.com/android/repository/android-ndk-r${NDK_VERSION}-linux-x86_64.zip -o /tmp/ndk.zip \
    && mkdir /opt/ndk \
    && unzip -q -d /opt/ndk /tmp/ndk.zip \
    && rm /tmp/ndk.zip

# download and install buck using debian package
# Allow building React Native from source
ARG BUCK_VERSION=2018.10.29.01
RUN curl -sS -L https://github.com/facebook/buck/releases/download/v${BUCK_VERSION}/buck.${BUCK_VERSION}_all.deb -o /tmp/buck.deb \
    && dpkg -i /tmp/buck.deb \
    && rm /tmp/buck.deb
