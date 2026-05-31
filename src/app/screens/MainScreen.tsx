import {Button, Image, Text, View} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../../App';
import { Header } from '../../shared/components/Header';
import { PageWrap } from '../../shared/components/PageWrap';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

export default function MainScreen({ navigation }: Props) {
    return (
        <PageWrap
            scroll={false}
            header={<Header title="메인" type="none" />}
        >
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
        </PageWrap>
    );
}
