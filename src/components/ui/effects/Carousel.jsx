import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import './Carousel.css'

/**
 * Carousel — 3D tilt carousel (React Bits pattern), icons via lucide-react.
 */
export function Carousel({
  children,
  itemsToShow = 1.25,
  autoPlay = false,
  interval = 5000,
  showArrows = true,
  showDots = false,
  infinite = true,
  containerClassName = '',
  iconClassName = '',
  dotClassName = '',
  ...props
}) {
  const containerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  const slides = useMemo(() => {
    if (Array.isArray(children)) return children
    if (children) return [children]
    return []
  }, [children])

  useEffect(() => {
    const updateCardWidth = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      setCardWidth(containerWidth / itemsToShow)
      setIsSmallScreen(window.innerWidth <= 768)
    }
    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)
    return () => window.removeEventListener('resize', updateCardWidth)
  }, [itemsToShow])

  useEffect(() => {
    if (!autoPlay || slides.length < 2) return undefined
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        infinite ? (prevIndex + 1) % slides.length : Math.min(prevIndex + 1, slides.length - 1),
      )
    }, interval)
    return () => clearInterval(intervalId)
  }, [autoPlay, interval, infinite, slides.length])

  const goToSlide = useCallback(
    (index) => {
      const lastSlide = slides.length - 1
      if (!infinite && index > lastSlide) {
        setCurrentIndex(lastSlide)
      } else if (!infinite && index < 0) {
        setCurrentIndex(0)
      } else {
        setCurrentIndex((index + slides.length) % slides.length)
      }
    },
    [slides.length, infinite],
  )

  const getSlideStyles = useCallback(
    (index) => {
      if (isSmallScreen) {
        return { transform: `translateX(${(index - currentIndex) * 100}%)` }
      }
      const offset = index - currentIndex
      const isCenter = offset === 0
      const isLeft = offset === -1
      const isRight = offset === 1
      const translateX = offset * 50
      const scale = isCenter ? 1 : 0.85
      const rotateY = isLeft || isRight ? -20 : 0
      const zIndex = isCenter ? 2 : isLeft || isRight ? 1 : 0
      const opacity = isCenter ? 1 : isLeft || isRight ? 0.7 : 0.3
      const translateZ = isCenter ? 100 : 0
      return {
        transform: `translateX(${translateX}%) translateZ(${translateZ}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
        zIndex,
        opacity,
      }
    },
    [currentIndex, isSmallScreen],
  )

  return (
    <div ref={containerRef} className={`carousel ${containerClassName}`} {...props}>
      {slides.length > 1 && showArrows && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className={`carousel-arrow left ${iconClassName}`}
            onClick={() => goToSlide(currentIndex - 1)}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className={`carousel-arrow right ${iconClassName}`}
            onClick={() => goToSlide(currentIndex + 1)}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {slides.map((slide, index) => (
        <motion.div
          key={index}
          className="carousel-slide"
          style={{ width: `${cardWidth}px`, ...getSlideStyles(index) }}
          initial={false}
          animate={getSlideStyles(index)}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          {slide}
        </motion.div>
      ))}

      {slides.length > 1 && showDots && (
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goToSlide(index)}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''} ${dotClassName}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
