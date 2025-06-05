import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyA0TrrMqLaGr4rgjnoC1YipdGk3i3JU89Q"; 

const ChatBotAi = () => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Chào bạn! Bạn gắp một số vấn đề sau khi tiêm à.", user: false },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now().toString(), text: input, user: true };
    setMessages((prev) => [userMessage, ...prev]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: "models/gemini-2.0-flash",
      });
      const prompt = `
        Bạn là chuyên gia tư vấn sức khỏe đáng tin cậy.
        Bạn giúp người dùng hiểu các triệu chứng và cách xử lý các vấn đề thường gặp sau khi tiêm chủng như: sốt, đau, nổi mẩn,...
        Trả lời ngắn gọn, dễ hiểu, không đưa ra chẩn đoán y khoa chính xác mà khuyến cáo tham khảo bác sĩ khi cần.
        Người dùng hỏi: ${input}
        `;
      const result = await model.generateContent(prompt);
      const botResponse = result.response.text();

      const botMessage = {
        id: Date.now().toString() + "-bot",
        text: botResponse,
        user: false,
      };
      setMessages((prev) => [botMessage, ...prev]);
    } catch (error) {
      setMessages((prev) => [
        {
          id: Date.now().toString() + "-error",
          text: "Có lỗi xảy ra khi gọi API",
          user: false,
        },
        ...prev,
      ]);
      console.error(error);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.message,
        item.user ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={{ color: item.user ? "white" : "black" }}>{item.text}</Text>
    </View>
  );

return (
  <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // điều chỉnh offset nếu cần
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
        keyboardShouldPersistTaps="handled" // để bấm vào item không làm mất focus
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={input}
          onChangeText={setInput}
          editable={!loading}
          onSubmitEditing={() => {
            sendMessage();
            Keyboard.dismiss();  // ẩn bàn phím sau khi gửi
          }}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            sendMessage();
            Keyboard.dismiss();
          }}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff" }}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
)}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  input: { flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 8 },
  button: {
    backgroundColor: "#007AFF",
    marginLeft: 8,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  userMessage: { backgroundColor: "#007AFF", alignSelf: "flex-end" },
  botMessage: { backgroundColor: "#e1e1e1", alignSelf: "flex-start" },
});

export default ChatBotAi;
