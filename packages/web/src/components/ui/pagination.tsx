import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  maxVisiblePages?: number
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Calculate start and end of visible range
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let start = Math.max(1, currentPage - halfVisible)
      let end = Math.min(totalPages, currentPage + halfVisible)

      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        end = maxVisiblePages
      } else if (currentPage > totalPages - halfVisible) {
        start = totalPages - maxVisiblePages + 1
      }

      // Add first page and ellipsis if needed
      if (start > 1) {
        pages.push(1)
        if (start > 2) {
          pages.push('ellipsis')
        }
      }

      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Add ellipsis and last page if needed
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push('ellipsis')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav className={cn('flex items-center justify-center space-x-1', className)} aria-label="Pagination">
      {/* First Page Button */}
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="hidden sm:flex"
        >
          First
        </Button>
      )}

      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div key={`ellipsis-${index}`} className="px-3 py-2">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            )
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[40px]',
                currentPage === page && 'bg-primary text-primary-foreground'
              )}
            >
              {page}
            </Button>
          )
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex items-center gap-1"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last Page Button */}
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="hidden sm:flex"
        >
          Last
        </Button>
      )}
    </nav>
  )
}

interface PaginationInfoProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  className?: string
}

export function PaginationInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
}: PaginationInfoProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={cn('text-sm text-muted-foreground', className)}>
      Showing {startItem} to {endItem} of {totalItems} flights
      {totalPages > 1 && (
        <span className="hidden sm:inline"> • Page {currentPage} of {totalPages}</span>
      )}
    </div>
  )
}
