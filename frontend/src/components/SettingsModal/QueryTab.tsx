import { useSettings } from "../../hooks/useSettings";

export const QueryTab = () => {
  const { config, setConfig } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Default Row Limit
        </label>
        <p className="text-xs text-text-secondary mb-3">
          Maximum number of rows to fetch in a single query result
        </p>
        <input
          type="number"
          value={config.query?.row_limit}
          onChange={(e) =>
            setConfig({ query: { row_limit: Number(e.target.value) } })
          }
          min="1"
          max="1000000"
          className="w-full px-3 py-2 rounded bg-bg-base border border-border text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <p className="text-xs text-text-secondary mt-2">
          This setting limits how many rows are returned to prevent memory
          issues with large results
        </p>
      </div>
    </div>
  );
};
