type WalletImportFormProps = {
  privateKey: string;
  loading: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onImport: () => void;
};

export function WalletImportForm({ privateKey, loading, error, onChange, onImport }: WalletImportFormProps) {
  return (
    <div className="space-y-3">
      <label className="grid gap-2">
        <span className="text-sm text-slate-300">Import private key</span>
        <textarea
          value={privateKey}
          onChange={(event) => onChange(event.target.value)}
          placeholder="0x..."
          rows={5}
          disabled={loading}
          className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
        />
      </label>

      {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      <button
        type="button"
        onClick={onImport}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-100 transition hover:border-sky-400/20 hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Importing...' : 'Import wallet'}
      </button>
    </div>
  );
}
