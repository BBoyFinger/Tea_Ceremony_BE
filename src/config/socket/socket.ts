import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import conversationModel from "../../models/conversationModel";

interface CurrentUser {
  _id: string;
  name: string;
}

interface ChatData {
  _id: string;
  sender: string;
  message: string;
  idConversation: string;
}

export const ConnectSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "https://tea-ware-fe.vercel.app",
      methods: ["GET", "POST"],
      allowedHeaders: ["my-custom-header"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join_conversation", async (idUser: string) => {
      try {
        const conversation = await conversationModel.findOne({ idUser });

        if (!conversation) return;

        const idConversation = String(conversation._id);
        socket.join(idConversation);
      } catch (error) {
        console.error("Error joining conversation:", error);
      }
    });

    socket.on("admin_join_conversation", (idConversation: string) => {
      socket.join(idConversation);
    });

    socket.on("create_conversation", async (currentUser: CurrentUser) => {
      try {
        const conversation = new conversationModel({
          idUser: currentUser._id,
          nameConversation: currentUser.name,
        });

        const data = await conversation.save();
        socket.join(String(data._id));
        socket.emit("response_room", data);
      } catch (error) {
        console.error("Error creating conversation:", error);
      }
    });

    socket.on("chat", async (data: ChatData) => {
      const { _id, sender, message, idConversation } = data;

      try {
        const conversation = await conversationModel.updateOne(
          { _id: idConversation },
          { lastMessage: message }
        );

        io.emit("lastMessage", conversation);

        const payload = {
          idConversation,
          sender,
          message,
          _id,
        };

        io.to(idConversation).emit("newMessage", payload);

        const conver = await conversationModel.findOne({ _id: idConversation });
        io.emit("show-me", conver);
      } catch (error) {
        console.error("Error handling chat:", error);
      }
    });

    socket.on("disconnect", () => {
      io.emit("user-leave", "User out room chat");
    });
  });
};
