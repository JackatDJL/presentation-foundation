export type Presentation = {
  id: string;
  shortname: string;
  title: string;
  description?: string;
  logo?: string;
  cover?: string;
  presentationFile?: {
    url: string;
    isLocked: boolean;
    password?: string;
  };
  handoutFile?: {
    url: string;
  };
  researchFile?: {
    url: string;
  };
  kahootPin?: string;
  kahootSelfHostUrl?: string;
  visibility: "public" | "private";
  owner: string;
  credits?: string;
  createdAt: string;
  updatedAt: string;
};

// Mock data for presentations
const presentations: Presentation[] = [
  {
    id: "1",
    shortname: "gpr",
    title: "Good Presentation",
    description:
      "This is a sample presentation about good presentation techniques.",
    logo: "/placeholder.svg?height=100&width=100",
    cover: "/placeholder.svg?height=600&width=1200",
    presentationFile: {
      url: "https://example.com/presentations/good-presentation.pdf",
      isLocked: true,
      password: "demo123",
    },
    handoutFile: {
      url: "https://example.com/handouts/good-presentation-handout.pdf",
    },
    researchFile: {
      url: "https://example.com/research/good-presentation-research.pdf",
    },
    kahootPin: "123456",
    kahootSelfHostUrl: "https://kahoot.it/challenge/123456",
    visibility: "public",
    owner: "user1",
    credits: "John Doe",
    createdAt: "2023-01-15T12:00:00Z",
    updatedAt: "2023-01-15T12:00:00Z",
  },
  {
    id: "2",
    shortname: "dsc",
    title: "Data Science Concepts",
    description:
      "An introduction to key data science concepts and methodologies.",
    logo: "/placeholder.svg?height=100&width=100",
    cover: "/placeholder.svg?height=600&width=1200",
    presentationFile: {
      url: "https://example.com/presentations/data-science.pdf",
      isLocked: false,
    },
    handoutFile: {
      url: "https://example.com/handouts/data-science-handout.pdf",
    },
    kahootPin: "none",
    visibility: "public",
    owner: "user1",
    createdAt: "2023-02-20T14:30:00Z",
    updatedAt: "2023-02-20T14:30:00Z",
  },
  {
    id: "3",
    shortname: "web",
    title: "Web Development Fundamentals",
    description:
      "Learn the basics of HTML, CSS, and JavaScript for web development.",
    logo: "/placeholder.svg?height=100&width=100",
    cover: "/placeholder.svg?height=600&width=1200",
    presentationFile: {
      url: "https://example.com/presentations/web-dev.pdf",
      isLocked: false,
    },
    handoutFile: {
      url: "https://example.com/handouts/web-dev-handout.pdf",
    },
    researchFile: {
      url: "https://example.com/research/web-dev-research.pdf",
    },
    kahootSelfHostUrl: "https://kahoot.it/challenge/789012",
    visibility: "public",
    owner: "user2",
    credits: "Web Dev Team",
    createdAt: "2023-03-10T09:15:00Z",
    updatedAt: "2023-03-10T09:15:00Z",
  },
  {
    id: "4",
    shortname: "ai",
    title: "Artificial Intelligence Overview",
    description: "A comprehensive overview of AI concepts and applications.",
    logo: "/placeholder.svg?height=100&width=100",
    cover: "/placeholder.svg?height=600&width=1200",
    presentationFile: {
      url: "https://example.com/presentations/ai-overview.pdf",
      isLocked: true,
      password: "ai2023",
    },
    handoutFile: {
      url: "https://example.com/handouts/ai-overview-handout.pdf",
    },
    researchFile: {
      url: "https://example.com/research/ai-overview-research.pdf",
    },
    kahootPin: "654321",
    kahootSelfHostUrl: "https://kahoot.it/challenge/654321",
    visibility: "public",
    owner: "user2",
    createdAt: "2023-04-05T16:45:00Z",
    updatedAt: "2023-04-05T16:45:00Z",
  },
  {
    id: "5",
    shortname: "prv",
    title: "Private Presentation",
    description: "This is a private presentation not visible in the main grid.",
    logo: "/placeholder.svg?height=100&width=100",
    cover: "/placeholder.svg?height=600&width=1200",
    presentationFile: {
      url: "https://example.com/presentations/private.pdf",
      isLocked: false,
    },
    visibility: "private",
    owner: "user1",
    createdAt: "2023-05-12T10:30:00Z",
    updatedAt: "2023-05-12T10:30:00Z",
  },
];

// Mock current user
export const currentUser = {
  id: "user1",
  name: "Demo User",
  email: "demo@example.com",
};

// Function to get all presentations
export function getPresentations() {
  return presentations;
}

// Function to get a presentation by shortname
export function getPresentation(shortname: string) {
  return presentations.find((p) => p.shortname === shortname);
}

// Function to check if user is owner of a presentation
export function isOwner(shortname: string, userId: string) {
  const presentation = getPresentation(shortname);
  return presentation?.owner === userId;
}

// Function to add a new presentation
export function addPresentation(
  presentation: Omit<Presentation, "id" | "createdAt" | "updatedAt">,
) {
  const newPresentation: Presentation = {
    ...presentation,
    id: (presentations.length + 1).toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  presentations.push(newPresentation);
  return newPresentation;
}

// Function to update a presentation
export function updatePresentation(
  shortname: string,
  updates: Partial<Presentation>,
) {
  const index = presentations.findIndex((p) => p.shortname === shortname);

  if (index !== -1) {
    presentations[index] = {
      ...presentations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return presentations[index];
  }

  return null;
}

// Function to delete a presentation
export function deletePresentation(shortname: string) {
  const index = presentations.findIndex((p) => p.shortname === shortname);

  if (index !== -1) {
    const deleted = presentations[index];
    presentations.splice(index, 1);
    return deleted;
  }

  return null;
}
