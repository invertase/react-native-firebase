/* eslint-disable no-console */
/* eslint-disable react/react-in-jsx-scope */
/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import QRCode from 'qrcode-generator';

import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  getAuth,
  getMultiFactorResolver,
  multiFactor,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  TotpSecret,
} from '@react-native-firebase/auth';
import { useEffect, useState } from 'react';

const Button = (props: {
  style?: ViewStyle;
  onPress: () => void;
  isLoading?: boolean;
  children: string;
}) => {
  return (
    <Pressable style={[styles.button, props.style]} onPress={props.onPress}>
      {props.isLoading && <ActivityIndicator />}

      {!props.isLoading && <Text style={styles.buttonText}>{props.children}</Text>}
    </Pressable>
  );
};

export function AuthTOTPDemonstrator() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), user => {
      setUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!user.emailVerified) {
    return (
      <VerifyEmail
        onComplete={() => {
          setUser(getAuth().currentUser);
        }}
      />
    );
  }

  return <Home />;
}

const VerifyEmail = ({ onComplete }: { onComplete: () => void }) => {
  const [loading, setIsLoading] = useState(false);

  const handleSendVerification = async () => {
    setIsLoading(true);
    console.log('should send verification email');
    try {
      await sendEmailVerification(getAuth().currentUser!);
    } catch (error) {
      console.error('error sending verification email', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadingUser = async () => {
    setIsLoading(true);
    console.log('should reload user to see if verified now');
    try {
      await reload(getAuth().currentUser!);
      onComplete();
      console.log('done reloading. verification status ' + getAuth().currentUser?.emailVerified);
    } catch (error) {
      console.error('error reloading user', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>{getAuth().currentUser?.email}</Text>
        <Text style={styles.subtitle}>Please Verify Your Email</Text>
        <Text style={styles.subtitle}>(check spam for the email if you do not see it)</Text>

        <Button onPress={handleSendVerification} isLoading={loading}>
          Send Verification Email
        </Button>
        <Button onPress={handleReloadingUser} isLoading={loading}>
          Check Verification Status
        </Button>

        <Pressable style={styles.secondaryButton} onPress={() => signOut(getAuth())}>
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setLoading] = useState(false);

  const [mfaError, setMfaError] = useState<FirebaseAuthTypes.MultiFactorError>();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(getAuth(), email, password);
      console.log('Login successful');
    } catch (error) {
      if ((error as { code: string }).code === 'auth/multi-factor-auth-required') {
        return setMfaError(error as FirebaseAuthTypes.MultiFactorError);
      }

      console.error('Error during login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(getAuth(), email, password);
      console.log('Sign up successful');
    } catch (error) {
      console.error('Error during signup:', error);
    } finally {
      setLoading(false);
    }
  };

  if (mfaError) {
    return <MfaLogin error={mfaError} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Please log in to continue</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setEmail}
            value={email}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
          />
        </View>
        <Button onPress={handleLogin} isLoading={isLoading}>
          Log in
        </Button>
        <Button style={{ marginTop: 20 }} onPress={handleSignUp} isLoading={isLoading}>
          Sign Up
        </Button>
      </View>
    </View>
  );
};

const MfaLogin = ({ error }: { error: FirebaseAuthTypes.MultiFactorError }) => {
  const [resolver, setResolver] = useState<FirebaseAuthTypes.MultiFactorResolver>();
  const [activeFactor, setActiveFactor] = useState<FirebaseAuthTypes.MultiFactorInfo>();

  const [code, setCode] = useState<string>('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const resolver = getMultiFactorResolver(getAuth(), error);
    setResolver(resolver);
    setActiveFactor(resolver.hints[0]);
    if (resolver.hints.length === 1) {
      const hint = resolver.hints[0];
      setActiveFactor(hint);
    }
  }, [error]);

  const handleConfirm = async () => {
    if (!resolver) return;

    try {
      setLoading(true);
      // For demo, assume only 1 hint and it's totp
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
        activeFactor!.uid,
        code,
      );
      return await resolver.resolveSignIn(multiFactorAssertion);
    } catch (error) {
      console.error('Error during MFA sign in:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!resolver) {
    return null;
  }

  // For demo, assume only 1 hint and it's totp
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Please enter the verification code from your authenticator app
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setCode}
            value={code}
            placeholder="Verification Code"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            textAlign="center"
            maxLength={6}
          />
        </View>

        <Button onPress={handleConfirm} isLoading={isLoading}>
          Verify
        </Button>
      </View>
    </View>
  );
};

const Home = () => {
  const [factors, setFactors] = useState(getAuth().currentUser?.multiFactor?.enrolledFactors);
  const [addingFactor, setAddingFactor] = useState(false);
  const [removingFactor, setRemovingFactor] = useState(false);

  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);

  const handleRemoveFactor = async (factor: FirebaseAuthTypes.MultiFactorInfo) => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;
      setRemovingFactor(true);

      const multiFactorUser = multiFactor(user);
      await multiFactorUser.unenroll(factor.uid);
      console.log(`Factor ${factor.factorId} removed successfully`);
    } catch (error) {
      console.error('Error removing factor:', error);
    } finally {
      setRemovingFactor(false);
    }

    setFactors(getAuth().currentUser?.multiFactor?.enrolledFactors);
  };

  const generateTotpSecret = async () => {
    console.log('in generateTotpSecret');
    setAddingFactor(true);
    const currentUser = getAuth().currentUser!;
    console.log(`got currentUser ${currentUser.email}`);
    try {
      const multiFactorSession = await multiFactor(currentUser).getSession();
      console.log(`got multiFactorSession`);
      setTotpSecret(await TotpMultiFactorGenerator.generateSecret(multiFactorSession, getAuth()));
    } catch (error) {
      console.error('Error generating TOTP Secret', error);
    } finally {
      setAddingFactor(false);
    }
  };

  if (totpSecret) {
    return (
      <EnrollTotp
        totpSecret={totpSecret}
        // totpUriQRBase64={totpUriQRBase64}
        onComplete={() => {
          setFactors(getAuth().currentUser?.multiFactor?.enrolledFactors);
          setTotpSecret(null);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Logged in as {getAuth().currentUser?.email}</Text>

        <Text style={[styles.subtitle, { marginBottom: 10 }]}>
          Enrolled factors: {factors?.length || 0}
        </Text>

        {factors?.map(factor => (
          <Button
            key={factor.uid}
            onPress={() => handleRemoveFactor(factor)}
            isLoading={removingFactor}
          >
            {`${factor.displayName || factor.factorId} (${factor.factorId}) Remove`}
          </Button>
        ))}

        <Button style={{ marginTop: 20 }} isLoading={addingFactor} onPress={generateTotpSecret}>
          Add TOTP Factor
        </Button>

        <Pressable style={styles.secondaryButton} onPress={() => signOut(getAuth())}>
          <Text style={styles.secondaryButtonText}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
};

const EnrollTotp = ({
  totpSecret,
  onComplete,
}: {
  totpSecret: TotpSecret;
  onComplete: () => void;
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    totpSecret
      .generateQrCodeUrl(getAuth().currentUser?.email, 'RNFB TOTP Demonstrator')
      .then(qrURL => {
        setQrCodeUrl(qrURL);
        const qr = QRCode(0, 'L');
        qr.addData(qrURL);
        qr.make();
        const qrDataURL = qr.createDataURL();
        setQrCodeBase64(qrDataURL);
      })
      .catch(e => console.error('error generating qa code url ' + e));
  }, []);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        verificationCode,
      );
      await multiFactor(user).enroll(multiFactorAssertion, 'Authenticator App');
      onComplete();
    } catch (error) {
      console.error('Error enrolling TOTP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Enroll Options</Text>
        {qrCodeBase64 !== '' && (
          <>
            <Text style={styles.text}>a) Scan the QR code</Text>
            <Image
              style={{
                width: 175,
                height: 175,
                resizeMode: 'contain',
                // borderWidth: 1,
                // borderColor: 'black',
              }}
              source={{ uri: qrCodeBase64 }}
            />
          </>
        )}

        <Text style={styles.text}>b) Open in app directly.</Text>
        <Button onPress={() => totpSecret.openInOtpApp(qrCodeUrl)} isLoading={isLoading}>
          Open In App
        </Button>

        <Text style={styles.subtitle}>c) Enter the secret manually</Text>

        <TextInput
          style={styles.input}
          value={totpSecret.secretKey}
          placeholder="TOTP Secret"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.subtitle}>
          Then enter the verification code from your authenticator app.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Verification Code"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          textAlign="center"
          maxLength={6}
          onChangeText={setVerificationCode}
          value={verificationCode}
        />
        <Button onPress={handleConfirm} isLoading={isLoading}>
          Confirm
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    fontWeight: '400',
  },
  text: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FAFBFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#0F172A',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 17,
    fontWeight: '600',
  },
});
