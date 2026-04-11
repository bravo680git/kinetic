import Content from "@/components/Content";
import Sidebar from "@/components/Sidebar";
import { useSettings } from "@/hooks/useSettings";
import { useSnippets } from "@/hooks/useSnippets";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ConnectionModal } from "./components/ConnectionModal";
import { SettingsModal } from "./components/SettingsModal";
import { SnippetsConfigModal } from "./components/SnippetsConfigModal";
import { TopBar } from "./components/TopBar";

function App() {
  const { loadConfig, loading } = useSettings();
  const { loadSnippets } = useSnippets();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadSnippets();
  }, [loadSnippets]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-base text-text-primary">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  return (
    <Tooltip.Provider>
      <div className="w-screen h-screen flex flex-col bg-bg-base text-text-primary">
        <TopBar />

        <div className="flex flex-1 min-h-0">
          <Sidebar />
          <Content />
        </div>

        <ConnectionModal />
        <SettingsModal />
        <SnippetsConfigModal />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Tooltip.Provider>
  );
}

export default App;
