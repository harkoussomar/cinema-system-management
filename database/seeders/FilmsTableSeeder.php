<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FilmsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $films = [
            [
                'title' => 'The Shawshank Redemption',
                'description' => 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                'genre' => 'Drama',
                'director' => 'Frank Darabont',
                'duration' => 142,
                'release_date' => '1994-09-23',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Godfather',
                'description' => 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
                'genre' => 'Crime',
                'director' => 'Francis Ford Coppola',
                'duration' => 175,
                'release_date' => '1972-03-24',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Pulp Fiction',
                'description' => 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
                'genre' => 'Crime',
                'director' => 'Quentin Tarantino',
                'duration' => 154,
                'release_date' => '1994-10-14',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'The Dark Knight',
                'description' => 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                'genre' => 'Action',
                'director' => 'Christopher Nolan',
                'duration' => 152,
                'release_date' => '2008-07-18',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Inception',
                'description' => 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                'genre' => 'Sci-Fi',
                'director' => 'Christopher Nolan',
                'duration' => 148,
                'release_date' => '2010-07-16',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($films as $film) {
            DB::table('films')->insert($film);
        }
    }
}
