import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const features = [
  ["ðŸ“ˆ", "Live Market Prices", "Search U.S. stocks using current market data."],
  ["ðŸ’¼", "Virtual Portfolio", "Buy and sell while tracking your virtual balance."],
  ["ðŸŽ¯", "Risk-Free Practice", "Test strategies without risking real money."],
];

const HomePage = () => (
  <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
    <Helmet>
      <title>Beta 1 Trading Simulator | T.O Analytics</title>
      <meta
        name="description"
        content="Try the new T.O Analytics Beta 1 paper-trading simulator and practise U.S. stock trading with virtual money."
      />
      <meta name="robots" content="index, follow" />
    </Helmet>

    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
        }}
      />
    </div>

    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-16">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between"
      >
        <Link to="/" className="group flex items-center gap-3" aria-label="T.O Analytics home">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
            T.O
          </span>
          <span>
            <span className="block text-base font-black tracking-tight">T.O Analytics</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Learn Â· Practise Â· Grow
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 sm:px-4">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-300 sm:text-xs">
            Now live
          </span>
        </div>
      </motion.header>

      <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
        >
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-4 py-2 backdrop-blur-xl">
            <span className="rounded-full bg-cyan-300 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-950">
              Beta 1
            </span>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-200">
              New trading feature
            </span>
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl xl:text-8xl">
            Learn trading by
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              actually trading.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-slate-300 sm:text-lg">
            Our new paper-trading simulator is here. Explore U.S. stocks, place virtual
            trades and learn how the market worksâ€”without risking real money.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              to="/trading-simulator"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-4 text-sm font-extrabold shadow-xl shadow-blue-900/30 transition duration-300 hover:-translate-y-1 hover:shadow-cyan-500/20"
            >
              Try Trading Simulator <span className="ml-3 text-lg">â†’</span>
            </Link>
            <p className="text-sm font-semibold text-slate-400">$100,000 in virtual buying power.</p>
          </div>

          <p className="mt-5 max-w-xl text-xs leading-5 text-slate-500">
            Beta software may change as we improve it. For education onlyâ€”no real trades
            or financial advice.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.85, delay: 0.2 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute inset-8 rounded-full bg-blue-500/20 blur-[70px]" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Trading Lab
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#081127]/80 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Account value</p>
              <p className="mt-2 text-4xl font-black tracking-tight">$100,000.00</p>
              <p className="mt-2 text-sm font-bold text-emerald-400">Ready to start trading</p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {features.map(([icon, title, description], index) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.12 }}
                  className={`rounded-2xl border border-white/10 bg-white/[0.05] p-4 ${index === 2 ? "sm:col-span-2" : ""}`}
                >
                  <span className="text-2xl">{icon}</span>
                  <h2 className="mt-3 text-sm font-black">{title}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="flex flex-col gap-3 border-t border-white/10 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>Â© {new Date().getFullYear()} T.O Analytics. All rights reserved.</p>
        <a href="mailto:hello@toanalytics.com" className="font-bold text-slate-400 transition hover:text-cyan-300">
          Contact us
        </a>
      </motion.footer>
    </div>
  </main>
);

export default HomePage;