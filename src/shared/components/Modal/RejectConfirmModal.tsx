import type { TextStyle } from "react-native";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, typography } from "../../styles";

type RejectConfirmModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  visible: boolean;
};

const WORD_JOINER = "\u2060";

function keepAllText(text: string) {
  return text
    .split(/(\s+)/)
    .map((chunk) => (/\s+/.test(chunk) ? chunk : Array.from(chunk).join(WORD_JOINER)))
    .join("");
}

export function RejectConfirmModal({
  onCancel,
  onConfirm,
  visible,
}: RejectConfirmModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>{keepAllText("결제 거절")}</Text>
          <Text style={styles.description}>
            {keepAllText("정말 거절하시겠습니까?")}
          </Text>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>아니오</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={styles.confirmButton}
            >
              <Text style={styles.confirmText}>예</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
  },
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(29, 31, 31, 0.5)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderColor: colors.neutral.grey1,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  cancelText: {
    ...typography.largeBold,
    color: colors.neutral.black2,
    fontFamily: typography.fontFamily,
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: colors.state.error,
    borderRadius: 8,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  confirmText: {
    ...typography.largeBold,
    color: colors.neutral.white,
    fontFamily: typography.fontFamily,
  },
  container: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    maxWidth: 320,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: "100%",
  },
  description: {
    ...typography.largeRegular,
    color: colors.neutral.black2,
    fontFamily: typography.fontFamily,
    marginTop: 12,
    overflowWrap: "normal",
    textAlign: "center",
    wordBreak: "keep-all",
    wordWrap: "normal",
  } as TextStyle,
  title: {
    ...typography.heading3,
    color: colors.neutral.black1,
    fontFamily: typography.fontFamily,
    overflowWrap: "normal",
    textAlign: "center",
    wordBreak: "keep-all",
    wordWrap: "normal",
  } as TextStyle,
});

export default RejectConfirmModal;
