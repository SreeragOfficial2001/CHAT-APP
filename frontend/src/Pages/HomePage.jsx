import { useChatStore } from "../store/useChatStore"; // Adjust path as needed

import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import SideBar from "../components/SideBar";

const HomePage = () => {
    const { selectedUser, messages, error } = useChatStore();
    
    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center pt-20 px-4">
                <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        <SideBar />
                        {!selectedUser ? (
                            <NoChatSelected />
                        ) : (
                            <ChatContainer messages={messages} error={error} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
