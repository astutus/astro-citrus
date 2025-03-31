import SFProRoundedBold from "@/assets/fonts/SF-Pro-Rounded-Bold.latin.base.ttf";
import SFProRoundedSemibold from "@/assets/fonts/SF-Pro-Rounded-Semibold.latin.base.ttf";
import SFProRoundedMedium from "@/assets/fonts/SF-Pro-Rounded-Medium.latin.base.ttf";
import SFProRoundedRegular from "@/assets/fonts/SF-Pro-Rounded-Regular.latin.base.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

const ogOptions: SatoriOptions = {
  width: 1200,
  height: 630,
  fonts: [
    {
      name: "SF Pro Rounded",
      data: Buffer.from(SFProRoundedRegular),
      weight: 400,
      style: "normal",
    },
    {
      name: "SF Pro Rounded",
      data: Buffer.from(SFProRoundedMedium),
      weight: 500,
      style: "normal",
    },
    {
      name: "SF Pro Rounded",
      data: Buffer.from(SFProRoundedSemibold),
      weight: 600,
      style: "normal",
    },
    {
      name: "SF Pro Rounded",
      data: Buffer.from(SFProRoundedBold),
      weight: 700,
      style: "normal",
    },
  ],
};

const size = {
  width: 1200,
  height: 630,
};

const markup = (title: string, pubDate: string) => html`
  <div
    tw="flex flex-col justify-between w-full h-full bg-[#fef2f2] text-[#1f1f1f] p-14"
  >
    <div tw="flex flex-col">
      <p tw="text-3xl text-[#d62828] font-medium mb-4">${pubDate}</p>
      <h1 tw="text-6xl font-bold leading-tight text-[#ba1a1a]">${title}</h1>
    </div>
    <div
      tw="flex items-center justify-between border-t border-[#e0e0e0] pt-6 mt-12"
    >
      <div tw="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
          width="64"
          height="64"
        >
          <path d="M0,120 L48,28 L66,58 L82,30 L128,120 Z" fill="#d62828" />
          <line
            x1="82"
            y1="30"
            x2="82"
            y2="10"
            stroke="white"
            stroke-width="3"
          />
          <polygon
            points="82,10 104,22 82,34"
            fill="#9a031e"
            stroke="white"
            stroke-width="1"
          />
        </svg>
        <p tw="ml-4 text-5xl text-[#9a031e] font-bold">${siteConfig.title}</p>
      </div>
      <p tw="text-3xl text-[#b91c1c] font-medium">by ${siteConfig.author}</p>
    </div>
  </div>
`;

export async function GET(context: APIContext) {
  const { pubDate, title } = context.props as {
    pubDate: string;
    title: string;
  };

  const formattedDate = getFormattedDate(pubDate, {
    month: "long",
    weekday: "long",
  });

  const svg = await satori(markup(title, formattedDate), ogOptions);

  if (context.url.pathname.endsWith(".png")) {
    const png = new Resvg(svg).render().asPng();
    return new Response(png, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": "image/png",
      },
    });
  }

  if (context.url.pathname.endsWith(".svg")) {
    return new Response(svg, {
      headers: {
        "Cache-Control": "public, max-age=31536000",
        "Content-Type": "image/svg+xml; charset=utf-8",
      },
    });
  }

  return new Response("Unsupported format", { status: 400 });
}

export async function getStaticPaths() {
  const posts = await getAllPosts();

  return posts
    .filter(({ data }) => !data.ogImage)
    .flatMap((post) =>
      ["png", "svg"].map((ext) => ({
        params: { slug: post.id, ext },
        props: {
          pubDate: post.data.updatedDate ?? post.data.publishDate,
          title: post.data.title,
        },
      }))
    );
}

