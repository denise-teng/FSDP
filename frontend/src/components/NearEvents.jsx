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
  <div className="py-12 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-center text-4xl sm:text-5xl font-bold text-blue-600 mb-10">
        Near Events
      </h2>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / itemsPerPage}%)`,
            }}
          >
            {nearEvents.map((event) => (
              <div
                key={event._id}
                className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2"
              >
                <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-4 h-full flex flex-col justify-between transition hover:shadow-lg">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 mb-1">{event.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {new Date(event.date).toLocaleDateString('en-MY')}
                    </p>

                    {event.startTime && (
                      <p className="text-sm text-gray-500 mb-1">
                        Time: {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ''}
                      </p>
                    )}

                    {event.location && (
                      <p className="text-sm text-gray-500 mb-1">
                        Location: {event.location}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 mb-1">
                      {event.description}
                    </p>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-blue-600 font-medium">{event.type}</p>
                    {event.isPermanent && (
                      <p className="text-xs text-emerald-600 font-semibold uppercase">
                        Permanent Event
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          disabled={isStartDisabled}
          className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition ${
            isStartDisabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={nextSlide}
          disabled={isEndDisabled}
          className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition ${
            isEndDisabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  </div>
)

  
}

export default NearEvents
