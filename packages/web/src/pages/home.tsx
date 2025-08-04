import { Button } from '@/components/ui/button'
import { Search, Calendar, MapPin } from 'lucide-react'

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Form Placeholder */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Search className="h-6 w-6" />
            Search Flights
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                From
              </label>
              <div className="h-10 bg-muted rounded-md flex items-center px-3 text-muted-foreground">
                Select departure city
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                To
              </label>
              <div className="h-10 bg-muted rounded-md flex items-center px-3 text-muted-foreground">
                Select destination city
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Departure Date
              </label>
              <div className="h-10 bg-muted rounded-md flex items-center px-3 text-muted-foreground">
                Select date
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button size="lg" className="px-8">
              <Search className="h-4 w-4 mr-2" />
              Search Flights
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
          <p className="text-muted-foreground">
            Find flights quickly with our intuitive search interface. Filter by price, time, and airline.
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Flexible Dates</h3>
          <p className="text-muted-foreground">
            Choose from available dates and find the best prices for your travel schedule.
          </p>
        </div>
        
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Multiple Destinations</h3>
          <p className="text-muted-foreground">
            Book flights to various destinations across Japan and beyond with trusted airlines.
          </p>
        </div>
      </div>
    </div>
  )
}
