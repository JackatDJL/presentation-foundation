import Link from "next/link"
import Image from "next/image"
import type { Presentation } from "~/lib/data"

export default function PresentationGrid({ presentations }: { presentations: Presentation[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {presentations.map((presentation) => (
        <Link key={presentation.id} href={`/?i=${presentation.shortname}`} className="group block">
          <div className="bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="relative h-48 w-full bg-gray-700">
              {presentation.cover ? (
                <Image
                  src={presentation.cover || "/placeholder.svg"}
                  alt={`Cover for ${presentation.title}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <span className="text-gray-500">No cover image</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                {presentation.logo && (
                  <div className="mr-4 relative w-12 h-12">
                    <Image
                      src={presentation.logo || "/placeholder.svg"}
                      alt={`Logo for ${presentation.title}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <h2 className="text-xl font-semibold text-white">{presentation.title}</h2>
              </div>

              {presentation.description && (
                <p className="text-gray-300 line-clamp-2 mb-4">{presentation.description}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

