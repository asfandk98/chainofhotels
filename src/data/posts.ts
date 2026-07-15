export interface Post {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
}

export const posts: Post[] = [
  {
    id: "arabian-hospitality",
    category: "LIFESTYLE • 5 MIN READ",
    title: "The Art of Arabian Hospitality: A Modern Guide",
    excerpt:
      "Discover the nuances of traditional customs reimagined for the modern luxury traveler...",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDUcLu3D4FqEj3ED-IIXzgkyzDCutqyKuaC9xuLtg0s3IivzBhijnpAyXfiJXsA3swAPh5gzG_1AU9TcGpI0nSNoljQmIaHRtFj1Fpi8Y2Q7STlk7BxixA3MESe8UJiTSOlk05iL2gyElfWZt5wcYXczZcKvR_cPoh5W3qK_3sIm6prKTag2R5MOFrGgAg3yJsTA8ivL9vJuRy_ION5XZUUH8RAvtll0Z9PWPo-n97EbUN2-WWubqPHBQ",
    alt: "A traditional gold Arabic coffee set and dates on a dark marble surface at sunset.",
  },
  {
    id: "desert-retreats",
    category: "ADVENTURE • 8 MIN READ",
    title: "Beyond the Skyscrapers: Desert Retreats 2024",
    excerpt:
      "Exploring the silence and majesty of the Liwa Oasis in ultra-luxury camp settings...",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmGt-o3Wxidw1U00jYNruGTiXESBbVaqdomRR5AzemvS2B2Hie9_WiHTpxgFFxe6BsoC8M6awnAuV7yyhUeBSbekfnhAndsZZuERmZvbk-xo6DClKgcLYSSGwq4Qz4pJeZE8Q2dq16IpyRgFOcURnv7CqqGerFmWLInB6jGnIyC6YauGNKlFHcoOxt2AZfn_TzfnS5qGOHsbXWXMktWGTaEEU7bghe2hNxQd2ceHm7h2rH4wKJ_3QfWw",
    alt: "Aerial view of a desert dune landscape at dawn with a luxury camp in the distance.",
  },
];
