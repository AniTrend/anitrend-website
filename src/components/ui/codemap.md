## Responsibility

`src/components/ui` is the shared UI primitive layer for the application. It provides shadcn-style React components that wrap Radix UI primitives, native HTML elements, Embla carousel primitives, and small local composition helpers.

This folder owns reusable visual and interaction building blocks such as buttons, form controls, overlays, menus, dialogs, tables, cards, toasts, sidebars, and loading placeholders. Consumers import these modules through the `@/components/ui/*` alias configured in `components.json`.

## Design

The component set follows the shadcn/ui default style with TypeScript enabled, React Server Components support enabled, Tailwind CSS variables enabled, and the neutral base color configured in `components.json`. Styling is applied with Tailwind utility strings and semantic theme tokens such as `bg-background`, `text-foreground`, `border-input`, `bg-popover`, `text-muted-foreground`, and sidebar-specific tokens.

Most interactive primitives are thin Radix wrappers. Files such as `accordion.tsx`, `alert-dialog.tsx`, `avatar.tsx`, `checkbox.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `label.tsx`, `menubar.tsx`, `popover.tsx`, `progress.tsx`, `radio-group.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `slider.tsx`, `switch.tsx`, `tabs.tsx`, `toast.tsx`, and `tooltip.tsx` preserve Radix behavior while adding project styling, default offsets, portals, icons, and typed refs.

Static primitives such as `alert.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `input.tsx`, `skeleton.tsx`, `table.tsx`, and `textarea.tsx` wrap native elements with reusable Tailwind classes. Variant driven components use `class-variance-authority`, including button, badge, alert, toast, sheet, and sidebar menu button variants.

`cn` from `@/lib/utils` is the shared class combiner. It runs `clsx` and `tailwind-merge`, so each component can combine default classes, conditional classes, variant output, and caller supplied `className` without keeping conflicting Tailwind classes. Components consistently call `cn(baseClasses, conditionalClasses, className)` or pass `className` through variant helpers.

Composition is exposed through compound component exports. Examples include `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, and `DialogDescription`, as well as similar groups for alert dialogs, sheets, cards, tables, menus, tabs, accordions, forms, toasts, carousel, and sidebar.

`asChild` composition is present where consumers need the component behavior and styling on another element. `Button` uses Radix `Slot` when `asChild` is true. `FormControl` always uses `Slot` to attach form IDs and accessibility props to the child control. Sidebar components also use `Slot` for `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarMenuButton`, `SidebarMenuAction`, and `SidebarMenuSubButton` when `asChild` is true. Radix trigger components such as tooltip and select icon usage can receive child composition from Radix APIs.

## Flow

Consumers render primitives by composing exported parts in the structure required by the underlying primitive. Root components hold state or provide context when needed, while child components render styled slots that inherit Radix data attributes, ARIA behavior, focus handling, keyboard interactions, and portal placement.

Overlay components follow a common flow. Dialog, alert dialog, sheet, popover, dropdown menu, menubar, select, tooltip, and toast wrappers expose root and trigger pieces, then render styled content inside Radix portals where needed. Overlay and content components merge caller classes with default animation classes driven by Radix `data-state` and `data-side` attributes.

Form flow is built around `react-hook-form`. `Form` re-exports `FormProvider`, `FormField` wraps `Controller` and stores the field name in context, `FormItem` creates a stable item ID, and `useFormField` combines field state with generated IDs. `FormLabel`, `FormControl`, `FormDescription`, and `FormMessage` consume that context to wire labels, descriptions, invalid state, and messages to the rendered control.

Carousel flow is managed by Embla. `Carousel` creates an Embla instance, stores it in local context, exposes previous and next handlers, tracks scroll availability, supports horizontal and vertical orientation, and accepts a `setApi` callback. `CarouselContent`, `CarouselItem`, `CarouselPrevious`, and `CarouselNext` consume the context to wire layout, keyboard navigation, controls, and disabled state.

Sidebar flow is context driven. `SidebarProvider` owns expanded or collapsed state, mobile open state, CSS variables for sidebar widths, and the toggle handler. `Sidebar` renders either a sheet-backed mobile sidebar or a desktop sidebar controlled by data attributes. Sidebar subcomponents consume context and data attributes for trigger behavior, rail toggling, inset layout, menu buttons, badges, nested menus, skeleton rows, and tooltip display when collapsed.

Toast flow separates state and presentation. `Toaster` reads toast entries from the toast hook and renders them inside `ToastProvider` with `Toast`, optional title and description, optional action, close button, and viewport. `toast.tsx` supplies the styled Radix primitives and toast variant types.

## Integration

Consumers import from `@/components/ui/*` and pass normal React props, Radix props, native element props, refs, variant props, `className`, and children. The `components.json` aliases map `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, and `@/hooks`, so UI modules can import shared utilities and other primitives without relative paths.

The UI layer integrates with `@/lib/utils` through `cn`, with Radix primitive packages for accessible behavior, with `lucide-react` for inline icons, with `class-variance-authority` for reusable variants, with `react-hook-form` for form composition, with Embla for carousel behavior, and with local hooks or primitives where higher level components need them.

Consumers can customize visuals by passing `className`, selecting supported variants and sizes, or using `asChild` to render a different element while preserving styles and behavior. Consumers are responsible for supplying semantic children, labels, controlled values, event handlers, form controllers, and application data.

The folder is intentionally low level. It should remain reusable across routes and feature components, while higher level feature behavior belongs in consumers such as app routes, section components, settings views, consent flows, and other domain-specific components.
