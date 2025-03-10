import type { Meta, StoryObj } from "@storybook/react";

import { AsyncViewLink } from "~/components/asyncLink";

const meta = {
  title: "Components/AsyncLinks/AsyncViewLink",
  component: AsyncViewLink,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof AsyncViewLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchParams: {},
    shortname: "test-pr",
    children: "Links to test-pr.djl.foundation",
  },
};

export const DevModeEnabled: Story = {
  args: {
    searchParams: { dev: "true" },
    shortname: "test-pr",
    children: "Links to (thisHost)/?dev=true&shortname=test-pr",
  },
};
