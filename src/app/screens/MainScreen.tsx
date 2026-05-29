import {Button, Image, Text, View} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function MainScreen({ navigation }: Props) {
    return (
        <View>
            <View>
                <Image
                    resizeMode="contain"
                    source={require('../../assets/images/erumpay-ci.png')}
                    style={{ width: '100%', height: 120 }}
                />
            </View>

            <Button
                title="IA 가이드"
                onPress={() => navigation.navigate('Guide')}
            />
        </View>
    );
}
