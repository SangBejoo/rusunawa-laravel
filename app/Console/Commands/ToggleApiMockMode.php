<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ToggleApiMockMode extends Command
{    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api:mock {mode : Enable, disable, or check API mock mode (on/off/status)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Toggle API mock mode for development without the Go API backend';

    /**
     * Execute the console command.
     */    public function handle()
    {
        $mode = $this->argument('mode');
        
        if (!in_array($mode, ['on', 'off', 'status'])) {
            $this->error('Invalid mode. Use "on", "off", or "status"');
            return 1;
        }
        
        $envFile = base_path('.env');
        $envContent = File::get($envFile);
        
        // If we're just checking status
        if ($mode === 'status') {
            // Check if API_MOCK_ENABLED exists in the .env file
            if (preg_match('/API_MOCK_ENABLED=\s*(true|false)/i', $envContent, $matches)) {
                $currentValue = strtolower($matches[1]);
                $statusText = $currentValue === 'true' ? 'ENABLED' : 'DISABLED';
                $this->info("API mock mode is currently {$statusText}");
                $this->line($currentValue === 'true' 
                    ? 'The application is using mocked API responses and NOT connecting to the Golang API.'
                    : 'The application is connecting to the real Golang API.');
            } else {
                $this->info('API mock mode is not configured in .env file');
            }
            return 0;
        }
        
        // Check if API_MOCK_ENABLED exists in the .env file
        if (strpos($envContent, 'API_MOCK_ENABLED') !== false) {
            // Replace the existing value
            $envContent = preg_replace(
                '/API_MOCK_ENABLED=\s*(true|false)/i',
                'API_MOCK_ENABLED=' . ($mode === 'on' ? 'true' : 'false'),
                $envContent
            );
        } else {
            // Add the setting to the API Configuration section
            if (strpos($envContent, '# API Configuration') !== false) {
                $envContent = preg_replace(
                    '/(# API Configuration.*?)(\r?\n\r?\n|$)/s',
                    "$1\nAPI_MOCK_ENABLED=" . ($mode === 'on' ? 'true' : 'false') . "$2",
                    $envContent
                );
            } else {
                // Add at the end of the file
                $envContent .= "\n\n# API Configuration\nAPI_MOCK_ENABLED=" . ($mode === 'on' ? 'true' : 'false') . "\n";
            }
        }
        
        File::put($envFile, $envContent);
        
        $this->info('API mock mode has been turned ' . strtoupper($mode));
        $this->info('API will ' . ($mode === 'on' ? 'NOT' : 'now') . ' connect to the real Go backend API');
        
        return 0;
    }
}
