export function PhoneFrame({ children }) {
  return (
    <main className="mx-auto min-h-[667px] w-full max-w-[375px] border-2 border-stone-900 bg-white p-4 shadow-sm">
      <div className="mb-4 flex h-5 items-center justify-between border-b border-stone-300 pb-3 text-[10px] text-stone-500">
        <span>9:41</span>
        <span>LTE</span>
      </div>
      {children}
    </main>
  )
}
