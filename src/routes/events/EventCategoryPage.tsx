import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/EventCategoryPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/events/EventCategoryPage"!</div>
}
