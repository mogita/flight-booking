import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination, PaginationInfo } from '../pagination'

describe('Pagination', () => {
  const mockOnPageChange = vi.fn()

  beforeEach(() => {
    mockOnPageChange.mockClear()
  })

  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders pagination controls when totalPages > 1', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    )

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    )

    const prevButton = screen.getByRole('button', { name: /previous/i })
    expect(prevButton).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('calls onPageChange when page number is clicked', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    )

    const page3Button = screen.getByRole('button', { name: '3' })
    fireEvent.click(page3Button)

    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when next button is clicked', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    expect(mockOnPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when previous button is clicked', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    )

    const prevButton = screen.getByRole('button', { name: /previous/i })
    fireEvent.click(prevButton)

    expect(mockOnPageChange).toHaveBeenCalledWith(2)
  })

  it('shows first and last buttons when showFirstLast is true', () => {
    render(
      <Pagination 
        currentPage={3} 
        totalPages={10} 
        onPageChange={mockOnPageChange} 
        showFirstLast={true}
      />
    )

    expect(screen.getByRole('button', { name: /first/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /last/i })).toBeInTheDocument()
  })

  it('highlights current page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    )

    const currentPageButton = screen.getByRole('button', { name: '3' })
    expect(currentPageButton).toHaveClass('bg-primary')
  })

  it('shows ellipsis for large page ranges', () => {
    render(
      <Pagination currentPage={5} totalPages={20} onPageChange={mockOnPageChange} />
    )

    // Should show ellipsis (represented by MoreHorizontal icon)
    const ellipsis = screen.getAllByTestId('more-horizontal-icon')
    expect(ellipsis.length).toBeGreaterThan(0)
  })
})

describe('PaginationInfo', () => {
  it('displays correct pagination information', () => {
    render(
      <PaginationInfo
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
      />
    )

    expect(screen.getByText(/showing 11 to 20 of 50 flights/i)).toBeInTheDocument()
    expect(screen.getByText(/page 2 of 5/i)).toBeInTheDocument()
  })

  it('handles last page correctly', () => {
    render(
      <PaginationInfo
        currentPage={3}
        totalPages={3}
        totalItems={25}
        itemsPerPage={10}
      />
    )

    expect(screen.getByText(/showing 21 to 25 of 25 flights/i)).toBeInTheDocument()
  })

  it('handles single page correctly', () => {
    render(
      <PaginationInfo
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={10}
      />
    )

    expect(screen.getByText(/showing 1 to 5 of 5 flights/i)).toBeInTheDocument()
    expect(screen.queryByText(/page/i)).not.toBeInTheDocument()
  })
})
