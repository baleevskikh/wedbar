export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-black px-6 text-center text-white">
      <div className="max-w-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/45">
          WedBar
        </p>
        <h1 className="mt-4 text-4xl font-black leading-none">
          Ой, кажется, вы вошли не в ту дверь
        </h1>
        <p className="mt-5 text-lg leading-7 text-white/65">
          Отсканируйте QR код на вашем столе, чтобы выполнить заказ.
        </p>
      </div>
    </main>
  );
}
