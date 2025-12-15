export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
  content: string;
};

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "millennial-design-trends",
    title: "Going all-in with millennial design",
    excerpt:
      "Explore how warm neutrals, biophilic accents, and flexible layouts are redefining modern homes for the millennial generation.",
    image: "/product/pd-1.jpg",
    date: "2025-10-14",
    author: "Admin",
    category: "Design",
    content: `
      <p>
        The modern millennial space balances intentional minimalism with tactile comfort.
        Think rounded silhouettes, saturated neutrals, and smart storage that doubles as sculpture.
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus.
      </p>
      <h3>Design is a journey, not a destination</h3>
      <p>
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <blockquote>“Design is not just what it looks like and feels like. Design is how it works.”</blockquote>
      <p>
        Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Nulla porttitor accumsan tincidunt.
      </p>
    `,
  },
  {
    id: "2",
    slug: "decorating-new-ways",
    title: "Exploring new ways of decorating",
    excerpt:
      "Layers of texture, tone-on-tone palettes, and sculptural lighting create depth without overwhelming the senses.",
    image: "/product/pd-2.jpg",
    date: "2025-08-03",
    author: "Admin",
    category: "Decor",
    content: `
      <p>
        Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Sed posuere consectetur est at lobortis.
      </p>
      <p>
        Maecenas faucibus mollis interdum. Cras justo odio, dapibus ac facilisis in, egestas eget quam.
      </p>
    `,
  },
  {
    id: "3",
    slug: "handmade-pieces",
    title: "Handmade pieces that took time to make",
    excerpt:
      "Celebrate artisanship by pairing heirloom woods with hand-thrown ceramics and woven textures.",
    image: "/product/pd-3.jpg",
    date: "2025-07-18",
    author: "Admin",
    category: "Craft",
    content: `
      <p>
        Etiam porta sem malesuada magna mollis euismod. Aenean lacinia bibendum nulla sed consectetur.
      </p>
      <p>
        Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
      </p>
    `,
  },
  {
    id: "4",
    slug: "modern-home-milan",
    title: "Modern home in Milan",
    excerpt:
      "An editorial walkthrough of a Milanese loft where mid-century shapes meet contemporary Italian cabinetry.",
    image: "/product/pd-4.jpg",
    date: "2025-06-12",
    author: "Admin",
    category: "Inspiration",
    content: `
      <p>
        Donec id elit non mi porta gravida at eget metus. Curabitur blandit tempus porttitor.
      </p>
      <p>
        Nulla vitae elit libero, a pharetra augue.
      </p>
    `,
  },
];

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}


