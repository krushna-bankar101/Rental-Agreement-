import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQwIDEwMCBMNDAgMTYwIEwxNjAgMTYwIEwxNjAgMTAwIEwxMDAgNDAgTDQwIDEwMCBNMTYwIDEwMCBMMTYwIDEyMCBNMTcwIDExMCBMMTUwIDExMCIgc3Ryb2tlPSIjM0EzQzdDIiBzdHJva2Utd2lkdGg9IjgiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjkwIiB5PSI4MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjcwIiByeD0iNSIgZmlsbD0iIzVDRThCNyIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIxNSIgZmlsbD0iIzVDRThCNyIvPjxwYXRoIGQ9Ik0xMTAgMTMwIEwxMjAgMTMwIEwxMjAgMTM1IEwxMTAgMTM1IE0xMTAgMTQwIEwxMjAgMTQwIEwxMjAgMTQ1IEwxMTAgMTQ1IiBmaWxsPSIjNUNFOEI3Ii8+PC9zdmc+'
export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
}
