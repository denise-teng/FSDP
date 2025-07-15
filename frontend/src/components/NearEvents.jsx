import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEventStore } from '../stores/useEventStore'

const NearEvents = () => {
  const { events, fetchAllEvents } = useEventStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(4)

  const nearEvents = useMemo(() => {
    const now = new Date()
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      const diffInDays = (eventDate - now) / (1000 * 60 * 60 * 24)

      const isSameDay =
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getDate() === now.getDate()

      if (isSameDay) {
        if (!event.startTime) return true
        const [h, m] = event.startTime.split(':').map(Number)
        const eventTime = new Date(eventDate)
        eventTime.setHours(h, m, 0, 0)
        return eventTime > now
      }

      return diffInDays > 0 && diffInDays <= 7
    })
  }, [events])

  useEffect(() => {
    fetchAllEvents()
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1)
      else if (window.innerWidth < 1024) setItemsPerPage(2)
      else if (window.innerWidth < 1280) setItemsPerPage(3)
      else setItemsPerPage(4)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const nextSlide = () => setCurrentIndex((prev) => prev + itemsPerPage)
  const prevSlide = () => setCurrentIndex((prev) => prev - itemsPerPage)
  const isStartDisabled = currentIndex === 0
  const isEndDisabled = currentIndex >= nearEvents.length - itemsPerPage

  if (nearEvents.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-center text-gray-400 text-xl">
        No near events this week.
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
          Near Events
        </h2>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / itemsPerPage
                }%)`,
              }}
            >
              {nearEvents.map((event) => (
                <div
                  key={event._id}
                  className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2"
                >
                  <div className="bg-gray-700 rounded-lg shadow-lg overflow-hidden h-full border border-emerald-500/30 p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-1">
                      {new Date(event.date).toLocaleDateString('en-MY')}
                    </p>

                    {event.startTime && (
                      <p className="text-sm text-gray-300 mb-1">
                        Time: {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ''}
                      </p>
                    )}

                    {event.location && (
                      <p className="text-sm text-gray-300 mb-1">
                        Location: {event.location}
                      </p>
                    )}

                    <p className="text-sm text-gray-300 mb-1">
                      {event.description}
                    </p>

                    <p className="text-sm text-emerald-300 font-medium mb-1">
                      {event.type}
                    </p>

                    {event.isPermanent && (
                      <p className="text-xs text-emerald-400 font-bold uppercase">
                        Permanent Event
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={prevSlide}
            disabled={isStartDisabled}
            className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full ${
              isStartDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isEndDisabled}
            className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full ${
              isEndDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NearEvents
