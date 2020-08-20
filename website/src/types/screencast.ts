export interface PageScreencastQuery {
  screenCast: Screencast;
  allScreenCast: {
    nodes: Screencast[];
  };
  next?: {
    title: string;
    slug: string;
  };
  previous?: {
    title: string;
    slug: string;
  };
}

export interface Screencast {
  id: string;
  vid: string;
  slug: string;
  title: string;
  description: string;
  tags?: string[];
}
