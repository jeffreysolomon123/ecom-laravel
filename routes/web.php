<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Middleware\VerifyCsrfToken;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/api/hello', function () {
    return response()->json(['message'=> 'Hello this is jeffrey']);
});


Route::post('/api/products', [ProductController::class, 'store']);
Route::get('/api/getproducts', [ProductController::class, 'index']);
Route::post('/api/categories', [CategoryController::class, 'store'])->name('categories.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
