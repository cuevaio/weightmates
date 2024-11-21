import Link from 'next/link';

import { PlayIcon, SparklesIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <div className="text-4xl">
          Weight<span className="font-bold">Mates</span>
        </div>
        <ol className="list-inside list-decimal text-center text-sm sm:text-left">
          <li className="mb-2">Loose weight with your friends and family</li>
          <li>
            Stay motivated with our AI assistant{' '}
            <SparklesIcon className="mb-1 ml-1 inline-flex size-3" />
          </li>
        </ol>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            className="flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent bg-foreground px-4 text-sm text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] sm:h-12 sm:px-5 sm:text-base"
            href="/teams"
          >
            <PlayIcon className="size-5 fill-current" />
            Start now
          </Link>
          <a
            className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#f2f2f2] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base"
            href="https://github.com/cuevaio/weightmates"
            target="_blank"
            rel="noopener noreferrer"
          >
            Check the code
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center">
        Build by
        <a
          className="ml-1 flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://cueva.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          cuevaio
        </a>
      </footer>
    </div>
  );
}
