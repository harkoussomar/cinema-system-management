<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OmdbApiService
{
    protected $apiKey;
    protected $baseUrl = 'https://www.omdbapi.com/';

    public function __construct()
    {
        $this->apiKey = config('services.omdb.key');
    }

    /**
     * Search for films by title
     *
     * @param string $query
     * @param int $page
     * @return array
     */
    public function searchByTitle(string $query, int $page = 1): array
    {
        if (empty($this->apiKey)) {
            Log::error('OMDB API key is not configured');
            return [
                'success' => false,
                'message' => 'OMDB API key is not configured',
                'data' => []
            ];
        }

        try {
            $response = Http::timeout(10)
                ->retry(3, 100)
                ->withoutVerifying()
                ->get($this->baseUrl, [
                    'apikey' => $this->apiKey,
                    's' => $query,
                    'page' => $page,
                    'type' => 'movie'
                ]);

            if ($response->successful() && $response->json('Response') === 'True') {
                return [
                    'success' => true,
                    'data' => $response->json('Search'),
                    'total' => (int) $response->json('totalResults')
                ];
            }

            $errorMessage = $response->json('Error') ?? 'Failed to retrieve data from OMDB API';
            Log::error('OMDB API Error: ' . $errorMessage, [
                'status' => $response->status(),
                'query' => $query,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => []
            ];
        } catch (\Exception $e) {
            Log::error('OMDB API Error: ' . $e->getMessage(), [
                'query' => $query,
                'exception' => get_class($e)
            ]);

            return [
                'success' => false,
                'message' => 'Error connecting to OMDB API: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }

    /**
     * Get detailed information about a specific film by IMDb ID
     *
     * @param string $imdbId
     * @return array
     */
    public function getFilmDetails(string $imdbId): array
    {
        if (empty($this->apiKey)) {
            Log::error('OMDB API key is not configured');
            return [
                'success' => false,
                'message' => 'OMDB API key is not configured',
                'data' => null
            ];
        }

        try {
            $response = Http::timeout(10)
                ->retry(3, 100)
                ->withoutVerifying()
                ->get($this->baseUrl, [
                    'apikey' => $this->apiKey,
                    'i' => $imdbId,
                    'plot' => 'full'
                ]);

            if ($response->successful() && $response->json('Response') === 'True') {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            $errorMessage = $response->json('Error') ?? 'Failed to retrieve film details';
            Log::error('OMDB API Error: ' . $errorMessage, [
                'status' => $response->status(),
                'imdbId' => $imdbId,
                'response' => $response->json()
            ]);

            return [
                'success' => false,
                'message' => $errorMessage,
                'data' => null
            ];
        } catch (\Exception $e) {
            Log::error('OMDB API Error: ' . $e->getMessage(), [
                'imdbId' => $imdbId,
                'exception' => get_class($e)
            ]);

            return [
                'success' => false,
                'message' => 'Error connecting to OMDB API: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }
}
