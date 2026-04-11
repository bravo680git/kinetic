import { QueryResultTabs } from "@/components/QueryResultTabs";
import { SqlEditor } from "@/components/SqlEditor";
import { useSettings } from "@/hooks/useSettings";
import { useUIStore } from "@/stores/ui";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useRef } from "react";
import {
  Group,
  Panel,
  PanelImperativeHandle,
  Separator,
} from "react-resizable-panels";

const Content = () => {
  const isResultsPanelCollapsed = useUIStore(
    (state) => state.isResultsPanelCollapsed,
  );
  const { updateConfig, config } = useSettings();
  const resultsPanelRef = useRef<PanelImperativeHandle>(null);
  const resultPanelSize = config.general?.result_panel_percentage ?? 50;

  const updatePanelSize = useCallback(
    debounce((layout: any) => {
      const percentage = (Object.values(layout)?.[1] as number) ?? 0;
      if (percentage <= 0) return;
      updateConfig({
        general: { result_panel_percentage: Math.round(percentage) },
      });
    }, 300),
    [updateConfig],
  );

  useEffect(() => {
    if (isResultsPanelCollapsed) {
      resultsPanelRef.current?.collapse();
    } else {
      resultsPanelRef.current?.expand();
    }
  }, [isResultsPanelCollapsed]);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Group orientation="vertical" onLayoutChanged={updatePanelSize}>
        <Panel
          minSize={20}
          defaultSize={100 - resultPanelSize}
          className="flex flex-col min-h-0 overflow-hidden"
        >
          <SqlEditor />
        </Panel>
        <Separator className="h-1 bg-border hover:bg-accent transition-colors" />
        <Panel
          panelRef={resultsPanelRef}
          defaultSize={resultPanelSize}
          minSize={10}
          collapsible
          className="flex flex-col min-h-0 overflow-hidden"
        >
          <QueryResultTabs />
        </Panel>
      </Group>
    </div>
  );
};

export default Content;
