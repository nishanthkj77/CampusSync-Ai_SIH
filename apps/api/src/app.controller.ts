import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      service: "campussync-api",
      status: "ok",
      version: "0.1.0",
    } as const;
  }
}
