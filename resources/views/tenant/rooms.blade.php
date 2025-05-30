@extends('layouts.app')

@section('title', 'Browse Rooms')

@section('content')
<div class="container">
    <h1 class="mb-2">
        <i class="fas fa-door-open me-2"></i> Available Rooms
    </h1>
    <p class="text-muted mb-4">Find and book the perfect room for your stay</p>
    
    <!-- Search and Filter -->
    <div class="card shadow mb-4">
        <div class="card-body">
            <form action="{{ route('tenant.rooms') }}" method="GET" id="room-filter-form">
                <div class="row">
                    <div class="col-md-3 mb-3">
                        <label for="classification" class="form-label">Room Type</label>
                        <select class="form-select" id="classification" name="classification">
                            <option value="">All Types</option>
                            <option value="perempuan" {{ request('classification') == 'perempuan' ? 'selected' : '' }}>Perempuan</option>
                            <option value="laki_laki" {{ request('classification') == 'laki_laki' ? 'selected' : '' }}>Laki-Laki</option>
                            <option value="VIP" {{ request('classification') == 'VIP' ? 'selected' : '' }}>VIP</option>
                        </select>
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="rental_type" class="form-label">Rental Period</label>
                        <select class="form-select" id="rental_type" name="rental_type">
                            <option value="">All Periods</option>
                            <option value="harian" {{ request('rental_type') == 'harian' ? 'selected' : '' }}>Harian</option>
                            <option value="bulanan" {{ request('rental_type') == 'bulanan' ? 'selected' : '' }}>Bulanan</option>
                        </select>
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="start_date" class="form-label">Check-in Date</label>
                        <input type="date" class="form-control" id="start_date" name="start_date" 
                               value="{{ request('start_date', date('Y-m-d')) }}">
                    </div>
                    <div class="col-md-3 mb-3">
                        <label for="end_date" class="form-label">Check-out Date</label>
                        <input type="date" class="form-control" id="end_date" name="end_date" 
                               value="{{ request('end_date', date('Y-m-d', strtotime('+1 month'))) }}">
                    </div>
                </div>
                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-search me-1"></i> Search Rooms
                    </button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Room List -->
    <div class="row" id="rooms-container">
        @foreach($rooms as $room)
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card shadow h-100">
                <div class="room-image">
                    <img src="https://via.placeholder.com/400x250?text=Room+{{ $room['name'] }}" class="card-img-top" alt="Room {{ $room['name'] }}">
                    <div class="room-price">
                        <span>Rp {{ number_format($room['rate'], 0, ',', '.') }}/
                        {{ $room['rental_type']['name'] == 'harian' ? 'day' : 'month' }}</span>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">{{ $room['name'] }}</h5>
                    <p class="card-text text-muted">
                        <i class="fas fa-tag me-1"></i> 
                        {{ ucfirst(str_replace('_', ' ', $room['classification']['name'])) }} &middot;
                        <i class="fas fa-users me-1"></i> Capacity: {{ $room['capacity'] }}
                    </p>
                    <p class="card-text">{{ Str::limit($room['description'], 100) }}</p>
                    
                    @if(!empty($room['amenities']))
                    <div class="amenities mb-3">
                        <small class="text-muted d-block mb-1">Amenities:</small>
                        @foreach($room['amenities'] as $amenity)
                            <span class="badge bg-light text-dark me-1 mb-1">
                                {{ $amenity['quantity'] }}x {{ $amenity['feature']['name'] }}
                            </span>
                        @endforeach
                    </div>
                    @endif
                </div>
                <div class="card-footer bg-white border-0">
                    <a href="{{ route('tenant.room.detail', $room['room_id']) }}" class="btn btn-primary w-100">
                        <i class="fas fa-info-circle me-1"></i> View Details
                    </a>
                </div>
            </div>
        </div>
        @endforeach
        
        @if(empty($rooms))
        <div class="col-12 text-center py-5">
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h4>No rooms found</h4>
            <p>Please try different search criteria or contact support.</p>
        </div>
        @endif
    </div>
    
    <!-- Pagination -->
    <div class="d-flex justify-content-center mt-4">
        <nav aria-label="Page navigation">
            <ul class="pagination">
                <!-- Placeholder for pagination links -->
                <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item"><a class="page-link" href="#">Next</a></li>
            </ul>
        </nav>
    </div>
</div>
@endsection

@section('styles')
<style>
    .room-image {
        position: relative;
        overflow: hidden;
    }
    
    .room-price {
        position: absolute;
        bottom: 0;
        right: 0;
        background-color: rgba(13, 110, 253, 0.85);
        color: white;
        padding: 5px 10px;
        font-weight: bold;
    }
    
    .amenities {
        display: flex;
        flex-wrap: wrap;
    }
</style>
@endsection

@section('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Form validation
        const form = document.getElementById('room-filter-form');
        const startDate = document.getElementById('start_date');
        const endDate = document.getElementById('end_date');
        
        form.addEventListener('submit', function(event) {
            if (new Date(endDate.value) <= new Date(startDate.value)) {
                alert('Check-out date must be after check-in date');
                event.preventDefault();
            }
        });
        
        // Update end date min value when start date changes
        startDate.addEventListener('change', function() {
            endDate.min = startDate.value;
            if (new Date(endDate.value) <= new Date(startDate.value)) {
                const nextDay = new Date(startDate.value);
                nextDay.setDate(nextDay.getDate() + 1);
                endDate.valueAsDate = nextDay;
            }
        });
    });
</script>
@endsection
