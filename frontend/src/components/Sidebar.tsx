import { ConnectionsList } from "@/components/ConnectionsList";
import { SchemaTree } from "@/components/SchemaTree";
import { useSchema } from "@/hooks/useSchema";
import { useSettingStore } from "@/stores/setting";

const Sidebar: React.FC = () => {
  const isSidebarCollapsed = useSettingStore(
    (state) => state.config.general?.sidebar_collapsed ?? false,
  );
  const { schema } = useSchema();

  return (
    <div
      className={`${
        isSidebarCollapsed ? "w-0" : "w-60"
      } shrink-0 border-r border-border overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
    >
      <ConnectionsList />
      <div className="flex-1 overflow-hidden">
        {schema && <SchemaTree schema={schema} />}
      </div>
    </div>
  );
};

export default Sidebar;
