import { Feather } from '@expo/vector-icons';
import type { TextStyle } from 'react-native';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';

import Button from '../Button';
import { colors } from '../../styles/designTokens';

type InviteLinkModalProps = {
  visible: boolean;
  title: string;
  description: string;
  linkText: string;
  isLoading?: boolean;
  isCopied?: boolean;
  copiedTitle?: string;
  copiedDescription?: string;
  copiedNotice?: string;
  loadingText?: string;
  copyLabel?: string;
  onClose: () => void;
  onPressCopy: () => void;
};

const WORD_JOINER = '\u2060';

function keepAllText(text: string) {
  return text
    .split(/(\s+)/)
    .map((chunk) => (/\s+/.test(chunk) ? chunk : Array.from(chunk).join(WORD_JOINER)))
    .join('');
}

const keepAllTextStyle = {
  overflowWrap: 'normal',
  wordBreak: 'keep-all',
  wordWrap: 'normal',
} as TextStyle;

export function InviteLinkModal({
  visible,
  title,
  description,
  linkText,
  isLoading = false,
  isCopied = false,
  copiedTitle = 'URL이 복사되었습니다.',
  copiedDescription,
  copiedNotice,
  loadingText = '초대 링크를 생성하는 중입니다.',
  copyLabel = '링크 복사',
  onClose,
  onPressCopy,
}: InviteLinkModalProps) {
  return (
    <RNModal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-neutral-black3 px-5">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View className="w-full max-w-[320px] rounded-2xl bg-neutral-white px-6 pb-6 pt-5">
          <View className="mb-6 flex-row items-center justify-between">
            <View className="min-w-0 flex-1 flex-row items-center">
              <Feather
                name={isCopied ? 'check-circle' : 'link'}
                size={24}
                color={colors.erum.main}
              />
              <Text
                className="ml-2 min-w-0 flex-1 font-pretendard text-heading-3 text-neutral-black1"
                style={keepAllTextStyle}
              >
                {keepAllText(isCopied ? copiedTitle : title)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              className="ml-3 h-8 w-8 items-center justify-center"
              onPress={onClose}
            >
              <Feather name="x" size={20} color={colors.neutral.black1} />
            </Pressable>
          </View>

          <Text
            className="font-pretendard text-large-regular text-neutral-black2"
            style={keepAllTextStyle}
          >
            {keepAllText(isCopied ? copiedDescription ?? description : description)}
          </Text>

          <View className="mt-5 rounded-xl border border-neutral-grey1 bg-neutral-grey2 px-4 py-4">
            <Text className="font-pretendard text-large-regular text-neutral-black2">
              {isLoading ? loadingText : linkText}
            </Text>
          </View>

          {isCopied && copiedNotice ? (
            <View className="mt-5 rounded-xl bg-[#EDFFF8] px-4 py-4">
              <Text
                className="text-center font-pretendard text-large-bold text-erum-main"
                style={keepAllTextStyle}
              >
                {keepAllText(copiedNotice)}
              </Text>
            </View>
          ) : (
            <View className="mt-5 flex-row gap-3">
              <View className="flex-1">
                <Button label="닫기" variant="secondary" onPress={onClose} />
              </View>
              <View className="flex-1">
                <Button
                  label={copyLabel}
                  disabled={isLoading || !linkText}
                  leftIcon={<Feather name="copy" size={16} color={colors.neutral.white} />}
                  onPress={onPressCopy}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
}

export default InviteLinkModal;
